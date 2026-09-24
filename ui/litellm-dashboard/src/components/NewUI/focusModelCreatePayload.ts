import type { Model } from "@/components/networking";
import { provider_map } from "@/components/provider_info_helpers";
import { ptuPickerToUtcIso } from "@/utils/ptuDatetime";
import dayjs from "dayjs";

export interface FocusModelMapping {
  public_name: string;
  litellm_model: string;
}

export type FocusModelCreateValues = Record<string, unknown> & {
  model?: string | string[];
  model_mappings?: FocusModelMapping[];
  custom_llm_provider?: string;
};

export interface FocusModelCreateMessages {
  jsonStringExpected: (fieldName: string) => string;
  jsonObjectExpected: (fieldName: string) => string;
  providerRequired: string;
  modelRequired: string;
  modelNamesRequired: string;
  extraParamsField: string;
  modelInfoField: string;
}

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

function providerSlug(provider: string): string {
  return provider_map[provider as keyof typeof provider_map] ?? provider.toLowerCase();
}

function parseObject(value: unknown, fieldName: string, messages: FocusModelCreateMessages): Record<string, unknown> {
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

function selectedModelNames(model: FocusModelCreateValues["model"]): string[] {
  if (Array.isArray(model)) return model;
  if (typeof model === "string" && model) return [model];
  return [];
}

function modelMappings(values: FocusModelCreateValues, messages: FocusModelCreateMessages): FocusModelMapping[] {
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

function baseParams(values: FocusModelCreateValues, messages: FocusModelCreateMessages): Record<string, unknown> {
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

function modelInfo(values: FocusModelCreateValues, messages: FocusModelCreateMessages): Record<string, unknown> {
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
    if (!dayjs.isDayjs(value)) continue;
    const converted = ptuPickerToUtcIso(value);
    if (converted !== null) info[field] = converted;
  }
  return info;
}

export function buildFocusModelCreatePayloads(
  values: FocusModelCreateValues,
  messages: FocusModelCreateMessages,
): Model[] {
  const params = baseParams(values, messages);
  const info = modelInfo(values, messages);
  return modelMappings(values, messages).map((mapping) => ({
    model_name: mapping.public_name,
    litellm_params: { ...params, model: mapping.litellm_model },
    model_info: { ...info },
  }));
}
