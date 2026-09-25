import type { Model } from "@/components/networking";
import { provider_map } from "@/components/provider_info_helpers";
import { ptuPickerToUtcIso, utcIsoToPickerValue } from "@/utils/ptuDatetime";
import { applyPtuModelInfo } from "@/utils/ptuModelInfo";
import { isMaskedSecret, stripMaskedSecrets } from "@/utils/maskedSecretUtils";
import {
  isFilledPtuValue,
  isNonNegativePtuRate,
  isPositiveWholePtuCount,
  ptuWindowIsOrdered,
} from "@/utils/ptuValidation";
import type { Dayjs } from "dayjs";
import { z } from "zod/v4";

export type TouchedPricingField = "input_cost" | "output_cost" | "cache_read_cost" | "cache_write_cost";

export interface ModelCacheControlInjectionPoint {
  location: "message";
  role?: "user" | "system" | "assistant";
  index?: string | number;
}

export interface ModelFormValues {
  model_name?: string;
  litellm_model_name?: string;
  api_base?: string;
  custom_llm_provider?: string;
  organization?: string;
  tpm?: string | number | null;
  rpm?: string | number | null;
  max_retries?: string | number | null;
  timeout?: string | number | null;
  stream_timeout?: string | number | null;
  input_cost?: string | number | null;
  output_cost?: string | number | null;
  cache_read_cost?: string | number | null;
  cache_write_cost?: string | number | null;
  ptu_count?: string | number | null;
  cost_per_ptu_per_hour?: string | number | null;
  ptu_effective_from?: Dayjs | null;
  ptu_effective_to?: Dayjs | null;
  cache_control?: boolean;
  cache_control_injection_points?: ModelCacheControlInjectionPoint[];
  model_access_group?: string[];
  guardrails?: string[];
  vector_store_ids?: string[];
  tags?: string[];
  health_check_model?: string | null;
  litellm_credential_name?: string | null;
  litellm_extra_params?: string;
  model_info?: string;
  team_id?: string;
}

export interface ModelCreateMapping {
  public_name: string;
  litellm_model: string;
}

export type ModelCreateValues = Record<string, unknown> & {
  model?: string | string[];
  model_mappings?: ModelCreateMapping[];
  custom_llm_provider?: string;
};

export interface ModelCreateMessages {
  jsonStringExpected: (fieldName: string) => string;
  jsonObjectExpected: (fieldName: string) => string;
  providerRequired: string;
  modelRequired: string;
  modelNamesRequired: string;
  extraParamsField: string;
  modelInfoField: string;
}

export const MODEL_CREATE_DEFAULTS = {
  mode: "chat",
  model: [],
  model_mappings: [],
  litellm_credential_name: "",
} as const;

/** Shell adapters intentionally retain legacy mounted-field semantics while sharing field identities. */
export const modelCreateFormDefaults = (shell: "legacy" | "focus"): Record<string, unknown> =>
  shell === "legacy" ? { litellm_credential_name: null } : { ...MODEL_CREATE_DEFAULTS };

/** Renderer-neutral identities and defaults for both model form shells. */
export const MODEL_FORM_FIELDS = {
  modelName: "model_name",
  providerModel: "litellm_model_name",
  provider: "custom_llm_provider",
  credential: "litellm_credential_name",
  team: "team_id",
  accessGroups: "model_access_group",
  ptuCount: "ptu_count",
  ptuRate: "cost_per_ptu_per_hour",
  ptuStart: "ptu_effective_from",
  ptuEnd: "ptu_effective_to",
} as const;

export const MODEL_EDIT_DEFAULTS: Pick<
  ModelFormValues,
  | "model_access_group"
  | "guardrails"
  | "tags"
  | "cache_control"
  | "cache_control_injection_points"
  | "litellm_credential_name"
> = {
  model_access_group: [],
  guardrails: [],
  tags: [],
  cache_control: false,
  cache_control_injection_points: [],
  litellm_credential_name: null,
};

export interface ModelFormValidationMessages {
  validJson: string;
  ptuCount: string;
  ptuRate: string;
  ptuPair: string;
  ptuStartRequired: string;
  ptuOrder: string;
  ptuPricing: string;
}

export interface TeamByokPolicy {
  visible: boolean;
  enabled: boolean;
  teamSelectionRequired: boolean;
}

/** The premium and role decision is shared; renderers only decide how to display it. */
export const teamByokPolicy = ({
  isProxyAdmin,
  premiumUser,
  isViewOnly,
}: {
  isProxyAdmin: boolean;
  premiumUser: boolean;
  isViewOnly: boolean;
}): TeamByokPolicy => ({
  visible: isProxyAdmin,
  enabled: isProxyAdmin && premiumUser && !isViewOnly,
  teamSelectionRequired: isProxyAdmin && premiumUser && !isViewOnly,
});

const UI_ONLY_FIELDS = new Set(["custom_pricing", "pricing_model", "cache_control"]);
const PRICING_FIELDS = new Set([
  "input_cost_per_token",
  "output_cost_per_token",
  "cache_read_input_token_cost",
  "cache_creation_input_token_cost",
]);
const PTU_NUMBER_FIELDS = new Set(["ptu_count", "cost_per_ptu_per_hour"]);
const PTU_DATE_FIELDS = new Set(["ptu_effective_from", "ptu_effective_to"]);
const NON_PARAMETER_FIELDS = new Set([
  "model",
  "model_mappings",
  "model_name",
  "custom_model_name",
  "model_access_group",
  "team_id",
  "mode",
  "base_model",
  "model_info_params",
  "litellm_extra_params",
]);

type ModelRecord = {
  model_name?: string;
  litellm_model_name?: string;
  litellm_params?: Record<string, unknown>;
  model_info?: Record<string, unknown>;
};

function providerSlug(provider: string): string {
  return provider_map[provider as keyof typeof provider_map] ?? provider.toLowerCase();
}

function parseObject(value: unknown, fieldName: string, messages: ModelCreateMessages): Record<string, unknown> {
  if (value == null || value === "") return {};
  if (typeof value !== "string") throw new Error(messages.jsonStringExpected(fieldName));
  const parsed: unknown = JSON.parse(value);
  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(messages.jsonObjectExpected(fieldName));
  }
  return parsed as Record<string, unknown>;
}

function pricingValue(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  return Number(value) / 1_000_000;
}

function selectedModelNames(model: ModelCreateValues["model"]): string[] {
  if (Array.isArray(model)) return model;
  if (typeof model === "string" && model) return [model];
  return [];
}

function modelMappings(values: ModelCreateValues, messages: ModelCreateMessages): ModelCreateMapping[] {
  const selectedModels = selectedModelNames(values.model);
  if (selectedModels.includes("all-wildcard")) {
    const provider = values.custom_llm_provider;
    if (!provider) throw new Error(messages.providerRequired);
    const wildcardModel = `${providerSlug(provider)}/*`;
    return [{ public_name: wildcardModel, litellm_model: wildcardModel }];
  }
  const mappings = values.model_mappings ?? [];
  if (mappings.length === 0) throw new Error(messages.modelRequired);
  if (mappings.some((mapping) => !mapping.public_name.trim() || !mapping.litellm_model.trim())) {
    throw new Error(messages.modelNamesRequired);
  }
  return mappings;
}

function shouldSkipParameter(key: string, value: unknown): boolean {
  if (value === "") return true;
  if (key === "litellm_credential_name" && value == null) return true;
  if (UI_ONLY_FIELDS.has(key) || NON_PARAMETER_FIELDS.has(key)) return true;
  return PTU_NUMBER_FIELDS.has(key) || PTU_DATE_FIELDS.has(key);
}

function assignParameter(params: Record<string, unknown>, key: string, value: unknown): void {
  if (key === "custom_llm_provider" && typeof value === "string") {
    params.custom_llm_provider = providerSlug(value);
    return;
  }
  if (PRICING_FIELDS.has(key)) {
    const converted = pricingValue(value);
    if (converted !== undefined) params[key] = converted;
    return;
  }
  params[key] = value;
}

function baseParams(values: ModelCreateValues, messages: ModelCreateMessages): Record<string, unknown> {
  const extraParams = parseObject(values.litellm_extra_params, messages.extraParamsField, messages);
  const params: Record<string, unknown> = { ...extraParams };
  if (typeof values.litellm_credential_name === "string" && values.litellm_credential_name) {
    delete params.litellm_credential_name;
  }
  for (const [key, value] of Object.entries(values)) {
    if (!shouldSkipParameter(key, value)) assignParameter(params, key, value);
  }
  const inputCost = pricingValue(values.input_cost_per_token);
  const hasCacheReadCost = values.cache_read_input_token_cost != null && values.cache_read_input_token_cost !== "";
  if (!hasCacheReadCost && inputCost !== undefined) params.cache_read_input_token_cost = inputCost;
  return params;
}

function createModelInfo(values: ModelCreateValues, messages: ModelCreateMessages): Record<string, unknown> {
  const info = parseObject(values.model_info_params, messages.modelInfoField, messages);
  if ("base_model" in values) info.base_model = values.base_model;
  if ("team_id" in values) info.team_id = values.team_id;
  if ("model_access_group" in values) info.access_groups = values.model_access_group;
  if ("mode" in values) info.mode = values.mode;
  for (const field of PTU_NUMBER_FIELDS) {
    const value = values[field];
    if (value != null && value !== "") info[field] = Number(value);
  }
  for (const field of PTU_DATE_FIELDS) {
    const value = values[field] as Dayjs | null | undefined;
    const converted = ptuPickerToUtcIso(value);
    if (converted !== null) info[field] = converted;
  }
  return info;
}

export function buildModelCreatePayloads(values: ModelCreateValues, messages: ModelCreateMessages): Model[] {
  const params = baseParams(values, messages);
  const info = createModelInfo(values, messages);
  const selectedCredential = values.litellm_credential_name;
  return modelMappings(values, messages).map((mapping) => ({
    model_name: mapping.public_name,
    litellm_params: {
      ...params,
      model: typeof values.model_name === "string" && values.model_name ? values.model_name : mapping.litellm_model,
      ...(selectedCredential ? { litellm_credential_name: selectedCredential } : {}),
    },
    model_info: { ...info },
  }));
}

const scalar = z.union([z.string(), z.number(), z.null()]).optional();
const text = z.string().optional();
const MODEL_EDIT_SCHEMA_SHAPE = {
  model_name: text,
  litellm_model_name: text,
  api_base: text,
  custom_llm_provider: text,
  organization: text,
  tpm: scalar,
  rpm: scalar,
  max_retries: scalar,
  timeout: scalar,
  stream_timeout: scalar,
  input_cost: scalar,
  output_cost: scalar,
  cache_read_cost: scalar,
  cache_write_cost: scalar,
  ptu_count: scalar,
  cost_per_ptu_per_hour: scalar,
  ptu_effective_from: z.custom<Dayjs | null>().nullish(),
  ptu_effective_to: z.custom<Dayjs | null>().nullish(),
  cache_control: z.boolean().optional(),
  cache_control_injection_points: z
    .array(
      z.object({
        location: z.literal("message"),
        role: z.enum(["user", "system", "assistant"]).optional(),
        index: z.union([z.string(), z.number()]).optional(),
      }),
    )
    .optional(),
  model_access_group: z.array(z.string()).optional(),
  guardrails: z.array(z.string()).optional(),
  vector_store_ids: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  health_check_model: z.string().nullish(),
  litellm_credential_name: z.string().nullish(),
  litellm_extra_params: text,
  model_info: text,
  team_id: text,
};

const PRICING_FORM_FIELDS: readonly TouchedPricingField[] = [
  "input_cost",
  "output_cost",
  "cache_read_cost",
  "cache_write_cost",
];

const validJson = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const validatePtuFormValues = ({
  values,
  isPtuEnabled,
  isFieldTouched,
  messages,
}: {
  values: ModelFormValues;
  isPtuEnabled: boolean;
  isFieldTouched: (field: TouchedPricingField) => boolean;
  messages: ModelFormValidationMessages;
}): { field: keyof ModelFormValues; message: string }[] => {
  if (!isPtuEnabled) return [];
  const issues: { field: keyof ModelFormValues; message: string }[] = [];
  const reject = (field: keyof ModelFormValues, message: string) => issues.push({ field, message });
  if (!isPositiveWholePtuCount(values.ptu_count)) reject("ptu_count", messages.ptuCount);
  if (!isNonNegativePtuRate(values.cost_per_ptu_per_hour)) reject("cost_per_ptu_per_hour", messages.ptuRate);
  if (isFilledPtuValue(values.ptu_count) !== isFilledPtuValue(values.cost_per_ptu_per_hour)) {
    reject("ptu_count", messages.ptuPair);
    reject("cost_per_ptu_per_hour", messages.ptuPair);
  }
  if (isFilledPtuValue(values.ptu_count) && !isFilledPtuValue(values.ptu_effective_from)) {
    reject("ptu_effective_from", messages.ptuStartRequired);
  }
  if (!ptuWindowIsOrdered(values.ptu_effective_from, values.ptu_effective_to)) {
    reject("ptu_effective_from", messages.ptuOrder);
    reject("ptu_effective_to", messages.ptuOrder);
  }
  for (const field of PRICING_FORM_FIELDS) {
    if (isFieldTouched(field) && isFilledPtuValue(values.ptu_count) && isFilledPtuValue(values[field])) {
      if (Number(values[field]) !== 0) reject(field, messages.ptuPricing);
    }
  }
  return issues;
};

export const buildModelEditSchema = ({
  isPtuEnabled,
  isFieldTouched,
  messages,
}: {
  isPtuEnabled: boolean;
  isFieldTouched: (field: TouchedPricingField) => boolean;
  messages: ModelFormValidationMessages;
}) =>
  z.object(MODEL_EDIT_SCHEMA_SHAPE).superRefine((values, context) => {
    const formValues = values as ModelFormValues;
    const reject = (field: keyof ModelFormValues, message: string) =>
      context.addIssue({ code: "custom", path: [field], message });
    if (formValues.litellm_extra_params && !validJson(formValues.litellm_extra_params)) {
      reject("litellm_extra_params", messages.validJson);
    }
    if (formValues.model_info && !validJson(formValues.model_info)) reject("model_info", messages.validJson);
    const ptuValidation = { values: formValues, isPtuEnabled, isFieldTouched, messages };
    for (const issue of validatePtuFormValues(ptuValidation)) {
      reject(issue.field, issue.message);
    }
  });

type ModelEditSource = {
  model_name?: string;
  litellm_model_name?: string;
  litellm_params?: Record<string, unknown>;
  model_info?: Record<string, unknown> | null;
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

const CACHE_CONTROL_ROLES = ["user", "system", "assistant"] as const;

const isCacheControlInjectionPoint = (value: unknown): value is ModelCacheControlInjectionPoint => {
  if (value == null || typeof value !== "object") return false;
  const point = value as Record<string, unknown>;
  const hasValidRole = point.role === undefined || CACHE_CONTROL_ROLES.some((role) => role === point.role);
  const hasValidIndex = point.index === undefined || typeof point.index === "string" || typeof point.index === "number";
  return point.location === "message" && hasValidRole && hasValidIndex;
};

const cacheControlInjectionPoints = (value: unknown): ModelCacheControlInjectionPoint[] =>
  Array.isArray(value) ? value.filter(isCacheControlInjectionPoint) : [];

const perMillionTokens = (...rates: unknown[]): number | null => {
  const rate = rates.find((candidate) => candidate != null);
  return rate == null ? null : Number(rate) * 1_000_000;
};

const OPTIONAL_EDIT_PARAM_FIELDS = [
  "api_base",
  "custom_llm_provider",
  "organization",
  "tpm",
  "rpm",
  "max_retries",
  "timeout",
  "stream_timeout",
] as const;

const definedEditParams = (params: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    OPTIONAL_EDIT_PARAM_FIELDS.filter((field) => params[field] !== undefined).map((field) => [field, params[field]]),
  );

/** Canonical edit initialization, including secret masking and PTU UTC conversion. */
export const initializeModelEditForm = (
  model: ModelEditSource,
  isWildcardModel: boolean,
  { includeModelInfo = false }: { includeModelInfo?: boolean } = {},
): ModelFormValues => {
  const params = model.litellm_params ?? {};
  const info = model.model_info ?? {};
  const injectionPoints = cacheControlInjectionPoints(params.cache_control_injection_points);
  const vectorStoreIds = asStringArray(params.vector_store_ids);
  return {
    ...MODEL_EDIT_DEFAULTS,
    model_name: model.model_name,
    litellm_model_name: model.litellm_model_name,
    ...definedEditParams(params),
    input_cost: perMillionTokens(params.input_cost_per_token, info.input_cost_per_token),
    output_cost: perMillionTokens(params.output_cost_per_token, info.output_cost_per_token),
    cache_read_cost: perMillionTokens(params.cache_read_input_token_cost, info.cache_read_input_token_cost),
    cache_write_cost: perMillionTokens(params.cache_creation_input_token_cost, info.cache_creation_input_token_cost),
    ptu_count: (info.ptu_count as string | number | null | undefined) ?? null,
    cost_per_ptu_per_hour: (info.cost_per_ptu_per_hour as string | number | null | undefined) ?? null,
    ptu_effective_from: utcIsoToPickerValue(info.ptu_effective_from as string | null | undefined),
    ptu_effective_to: utcIsoToPickerValue(info.ptu_effective_to as string | null | undefined),
    cache_control: injectionPoints.length > 0,
    cache_control_injection_points: injectionPoints,
    model_access_group: asStringArray(info.access_groups),
    guardrails: asStringArray(params.guardrails),
    ...(vectorStoreIds.length > 0 ? { vector_store_ids: vectorStoreIds } : {}),
    tags: asStringArray(params.tags),
    ...(isWildcardModel ? { health_check_model: info.health_check_model as string | null | undefined } : {}),
    litellm_credential_name: (params.litellm_credential_name as string | null | undefined) ?? null,
    litellm_extra_params: JSON.stringify(
      Object.fromEntries(
        Object.entries(params).filter(([key, value]) => key !== "litellm_credential_name" && !isMaskedSecret(value)),
      ),
      null,
      2,
    ),
    ...(includeModelInfo ? { model_info: JSON.stringify(info, null, 2) } : {}),
    team_id: (info.team_id as string | undefined) ?? undefined,
  };
};

function numberOrNull(value: string | number | null | undefined): number | null {
  return value !== undefined && value !== null && value !== "" ? Number(value) / 1_000_000 : null;
}

const parseUpdateObject = (
  value: string | undefined,
  fallback: unknown,
  fieldName: string,
): Record<string, unknown> => {
  const parsed = value ? JSON.parse(value) : fallback ?? {};
  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Invalid JSON in ${fieldName}`);
  }
  return { ...(parsed as Record<string, unknown>) };
};

const buildUpdateBaseParams = (values: ModelFormValues): Record<string, unknown> => {
  const extraParams = parseUpdateObject(values.litellm_extra_params, {}, "Nexoplane Params");
  delete extraParams.litellm_credential_name;
  return {
    ...extraParams,
    model: values.litellm_model_name,
    api_base: values.api_base,
    custom_llm_provider: values.custom_llm_provider,
    organization: values.organization,
    tpm: values.tpm,
    rpm: values.rpm,
    max_retries: values.max_retries,
    timeout: values.timeout,
    stream_timeout: values.stream_timeout,
    tags: values.tags,
  };
};

const applyUpdatePricing = (
  params: Record<string, unknown>,
  values: ModelFormValues,
  isFieldTouched: (field: TouchedPricingField) => boolean,
) => {
  const costParams: Record<TouchedPricingField, string> = {
    input_cost: "input_cost_per_token",
    output_cost: "output_cost_per_token",
    cache_read_cost: "cache_read_input_token_cost",
    cache_write_cost: "cache_creation_input_token_cost",
  };
  for (const [field, parameter] of Object.entries(costParams) as [TouchedPricingField, string][]) {
    if (isFieldTouched(field)) params[parameter] = numberOrNull(values[field]);
  }
  if (!isFieldTouched("cache_read_cost") && isFieldTouched("input_cost") && params.input_cost_per_token != null) {
    params.cache_read_input_token_cost = params.input_cost_per_token;
  }
};

const applyUpdateCredentialAndCollections = (
  params: Record<string, unknown>,
  model: ModelRecord,
  values: ModelFormValues,
): string | null => {
  const storedCredentialName = (model.litellm_params?.litellm_credential_name as string | null | undefined) ?? null;
  const selectedCredentialName = values.litellm_credential_name || null;
  if (selectedCredentialName !== storedCredentialName) params.litellm_credential_name = selectedCredentialName;
  else delete params.litellm_credential_name;
  if (values.guardrails) params.guardrails = values.guardrails;
  if (values.vector_store_ids !== undefined) params.vector_store_ids = values.vector_store_ids;
  const hadInjectionPoints = Boolean(model.litellm_params?.cache_control_injection_points);
  if (values.cache_control && (values.cache_control_injection_points?.length ?? 0) > 0) {
    params.cache_control_injection_points = values.cache_control_injection_points;
  } else if (hadInjectionPoints) {
    params.cache_control_injection_points = null;
  } else {
    delete params.cache_control_injection_points;
  }
  return selectedCredentialName;
};

const buildUpdateModelInfo = (
  model: ModelRecord,
  values: ModelFormValues,
  ptuCostAttributionEnabled: boolean,
): Record<string, unknown> => {
  let info = parseUpdateObject(values.model_info, model.model_info, "Model Info");
  if (values.model_access_group) info = { ...info, access_groups: values.model_access_group };
  if (values.health_check_model !== undefined) info = { ...info, health_check_model: values.health_check_model };
  if (values.team_id) info = { ...info, team_id: values.team_id };
  return applyPtuModelInfo(info, values, ptuCostAttributionEnabled);
};

export function buildModelUpdatePayload({
  model,
  values,
  isFieldTouched,
  ptuCostAttributionEnabled,
}: {
  model: ModelRecord;
  values: ModelFormValues;
  isFieldTouched: (field: TouchedPricingField) => boolean;
  ptuCostAttributionEnabled: boolean;
}) {
  const litellmParams = buildUpdateBaseParams(values);
  applyUpdatePricing(litellmParams, values, isFieldTouched);
  const selectedCredentialName = applyUpdateCredentialAndCollections(litellmParams, model, values);
  const modelInfo = buildUpdateModelInfo(model, values, ptuCostAttributionEnabled);
  const safeLitellmParams = stripMaskedSecrets(litellmParams);
  const { litellm_credential_name: _credential, ...localLitellmParams } = safeLitellmParams;
  return {
    patch: {
      model_name: values.model_name,
      litellm_params: safeLitellmParams,
      model_info: modelInfo,
    },
    updatedModel: {
      ...model,
      model_name: values.model_name,
      litellm_model_name: values.litellm_model_name,
      litellm_params:
        selectedCredentialName === null
          ? localLitellmParams
          : { ...localLitellmParams, litellm_credential_name: selectedCredentialName },
      model_info: modelInfo,
    },
  };
}
