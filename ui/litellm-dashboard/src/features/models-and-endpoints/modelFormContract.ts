import type { Model } from "@/components/networking";
import { provider_map } from "@/components/provider_info_helpers";
import { ptuPickerToUtcIso } from "@/utils/ptuDatetime";
import { applyPtuModelInfo } from "@/utils/ptuModelInfo";
import { stripMaskedSecrets } from "@/utils/maskedSecretUtils";
import type { Dayjs } from "dayjs";

export type TouchedPricingField = "input_cost" | "output_cost" | "cache_read_cost" | "cache_write_cost";

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
  cache_control_injection_points?: unknown[];
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
  if (value == null || value === "") return true;
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
  if (values.base_model) info.base_model = values.base_model;
  if (values.team_id) info.team_id = values.team_id;
  if (values.model_access_group) info.access_groups = values.model_access_group;
  if (values.mode) info.mode = values.mode;
  for (const field of PTU_NUMBER_FIELDS) {
    const value = values[field];
    if (value != null && value !== "") info[field] = Number(value);
  }
  for (const field of PTU_DATE_FIELDS) {
    const value = values[field];
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

function numberOrNull(value: string | number | null | undefined): number | null {
  return value !== undefined && value !== null && value !== "" ? Number(value) / 1_000_000 : null;
}

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
  const parsedExtraParams = values.litellm_extra_params ? JSON.parse(values.litellm_extra_params) : {};
  if (parsedExtraParams == null || typeof parsedExtraParams !== "object" || Array.isArray(parsedExtraParams)) {
    throw new Error("Invalid JSON in Nexoplane Params");
  }
  const extraParams = { ...(parsedExtraParams as Record<string, unknown>) };
  delete extraParams.litellm_credential_name;
  const litellmParams: Record<string, unknown> = {
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
  const costParams: Record<TouchedPricingField, string> = {
    input_cost: "input_cost_per_token",
    output_cost: "output_cost_per_token",
    cache_read_cost: "cache_read_input_token_cost",
    cache_write_cost: "cache_creation_input_token_cost",
  };
  for (const [field, parameter] of Object.entries(costParams) as [TouchedPricingField, string][]) {
    if (isFieldTouched(field)) litellmParams[parameter] = numberOrNull(values[field]);
  }
  if (
    !isFieldTouched("cache_read_cost") &&
    isFieldTouched("input_cost") &&
    litellmParams.input_cost_per_token != null
  ) {
    litellmParams.cache_read_input_token_cost = litellmParams.input_cost_per_token;
  }
  const storedCredentialName = (model.litellm_params?.litellm_credential_name as string | null | undefined) ?? null;
  const selectedCredentialName = values.litellm_credential_name || null;
  if (selectedCredentialName !== storedCredentialName) {
    litellmParams.litellm_credential_name = selectedCredentialName;
  } else {
    delete litellmParams.litellm_credential_name;
  }
  if (values.guardrails) litellmParams.guardrails = values.guardrails;
  if (values.vector_store_ids !== undefined) litellmParams.vector_store_ids = values.vector_store_ids;
  const hadInjectionPoints = Boolean(model.litellm_params?.cache_control_injection_points);
  if (values.cache_control && (values.cache_control_injection_points?.length ?? 0) > 0) {
    litellmParams.cache_control_injection_points = values.cache_control_injection_points;
  } else if (hadInjectionPoints) {
    litellmParams.cache_control_injection_points = null;
  } else {
    delete litellmParams.cache_control_injection_points;
  }
  const parsedModelInfo = values.model_info ? JSON.parse(values.model_info) : model.model_info ?? {};
  if (parsedModelInfo == null || typeof parsedModelInfo !== "object" || Array.isArray(parsedModelInfo)) {
    throw new Error("Invalid JSON in Model Info");
  }
  let modelInfo: Record<string, unknown> = { ...(parsedModelInfo as Record<string, unknown>) };
  if (values.model_access_group) modelInfo = { ...modelInfo, access_groups: values.model_access_group };
  if (values.health_check_model !== undefined) modelInfo = { ...modelInfo, health_check_model: values.health_check_model };
  if (values.team_id) modelInfo = { ...modelInfo, team_id: values.team_id };
  modelInfo = applyPtuModelInfo(modelInfo, values, ptuCostAttributionEnabled);
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
