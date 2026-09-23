"use client";

import { TagsInput } from "@/app/(dashboard)/guardrails/_components/content_filter/TagsInput";
import type { ModelData } from "@/components/model_dashboard/types";
import type { CredentialItem } from "@/components/networking";
import { FormField } from "@/components/shared/form/FormField";
import { UtcDateTimeInput } from "@/components/shared/form/UtcDateTimeInput";
import NumericalInput from "@/components/shared/numerical_input";
import type { Tag } from "@/components/tag_management/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UiLoadingSpinner } from "@/components/ui/ui-loading-spinner";
import VectorStoreSelector from "@/components/vector_store_management/VectorStoreSelector";
import { isMaskedSecret } from "@/utils/maskedSecretUtils";
import {
  MAX_COST_PER_PTU_PER_HOUR,
  MAX_PTU_COUNT,
  isFilledPtuValue,
  isNonNegativePtuRate,
  isPositiveWholePtuCount,
  ptuWindowIsOrdered,
} from "@/utils/ptuValidation";
import { utcIsoToPickerValue } from "@/utils/ptuDatetime";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dayjs } from "dayjs";
import { CircleHelp } from "lucide-react";
import { useCallback, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod/v4";
import {
  FocusCacheControlInjectionPoints,
  type FocusCacheControlInjectionPoint,
} from "./FocusCacheControlInjectionPoints";

export type TouchedPricingField = "input_cost" | "output_cost" | "cache_read_cost" | "cache_write_cost";

export interface ModelEditFormValues {
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
  cache_control_injection_points?: FocusCacheControlInjectionPoint[];
  model_access_group?: string[];
  guardrails?: string[];
  vector_store_ids?: string[];
  tags?: string[];
  health_check_model?: string | null;
  litellm_credential_name?: string;
  litellm_extra_params?: string;
  model_info?: string;
}

type ModelEditFieldName = keyof ModelEditFormValues;
type Translate = (key: string, options?: Record<string, unknown>) => string;

const PRICING_FIELDS: readonly TouchedPricingField[] = [
  "input_cost",
  "output_cost",
  "cache_read_cost",
  "cache_write_cost",
];

const scalar = z.union([z.string(), z.number(), z.null()]).optional();
const text = z.string().optional();
const modelEditShape = {
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
  cache_control_injection_points: z.array(z.custom<FocusCacheControlInjectionPoint>()).optional(),
  model_access_group: z.array(z.string()).optional(),
  guardrails: z.array(z.string()).optional(),
  vector_store_ids: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  health_check_model: z.string().nullish(),
  litellm_credential_name: text,
  litellm_extra_params: text,
  model_info: text,
};

function isJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function buildSchema(isPtuEnabled: boolean, isFieldTouched: (field: TouchedPricingField) => boolean, t: Translate) {
  return z.object(modelEditShape).superRefine((values, context) => {
    const reject = (path: ModelEditFieldName, message: string) =>
      context.addIssue({ code: "custom", path: [path], message });

    if (values.litellm_extra_params && !isJson(values.litellm_extra_params)) {
      reject("litellm_extra_params", t("models.editor.validation.validJson"));
    }
    if (values.model_info && !isJson(values.model_info)) {
      reject("model_info", t("models.editor.validation.validJson"));
    }
    if (!isPtuEnabled) return;

    if (!isPositiveWholePtuCount(values.ptu_count)) {
      reject("ptu_count", t("models.editor.validation.ptuCount", { max: MAX_PTU_COUNT.toLocaleString() }));
    }
    if (!isNonNegativePtuRate(values.cost_per_ptu_per_hour)) {
      reject(
        "cost_per_ptu_per_hour",
        t("models.editor.validation.ptuRate", { max: MAX_COST_PER_PTU_PER_HOUR.toLocaleString() }),
      );
    }
    if (isFilledPtuValue(values.ptu_count) !== isFilledPtuValue(values.cost_per_ptu_per_hour)) {
      const message = t("models.editor.validation.ptuPair");
      reject("ptu_count", message);
      reject("cost_per_ptu_per_hour", message);
    }
    if (isFilledPtuValue(values.ptu_count) && !isFilledPtuValue(values.ptu_effective_from)) {
      reject("ptu_effective_from", t("models.editor.validation.ptuStartRequired"));
    }
    if (!ptuWindowIsOrdered(values.ptu_effective_from, values.ptu_effective_to)) {
      const message = t("models.editor.validation.ptuOrder");
      reject("ptu_effective_from", message);
      reject("ptu_effective_to", message);
    }
    for (const field of PRICING_FIELDS) {
      if (!isFieldTouched(field)) continue;
      if (!isFilledPtuValue(values.ptu_count)) continue;
      const value = values[field];
      if (!isFilledPtuValue(value)) continue;
      if (Number(value) === 0) continue;
      reject(field, t("models.editor.validation.ptuPricing"));
    }
  });
}

function perMillionTokens(...rates: (number | null | undefined)[]): number | null {
  const rate = rates.find((candidate) => candidate != null);
  return rate == null ? null : rate * 1_000_000;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function buildPricingValues(
  model: ModelData,
): Pick<ModelEditFormValues, "input_cost" | "output_cost" | "cache_read_cost" | "cache_write_cost"> {
  const params = model.litellm_params;
  const info = model.model_info;
  return {
    input_cost: perMillionTokens(params.input_cost_per_token, info.input_cost_per_token as number | undefined),
    output_cost: perMillionTokens(params.output_cost_per_token, info.output_cost_per_token as number | undefined),
    cache_read_cost: perMillionTokens(
      params.cache_read_input_token_cost as number | undefined,
      info.cache_read_input_token_cost as number | undefined,
    ),
    cache_write_cost: perMillionTokens(
      params.cache_creation_input_token_cost as number | undefined,
      info.cache_creation_input_token_cost as number | undefined,
    ),
  };
}

function buildPtuValues(
  model: ModelData,
): Pick<ModelEditFormValues, "ptu_count" | "cost_per_ptu_per_hour" | "ptu_effective_from" | "ptu_effective_to"> {
  const info = model.model_info;
  return {
    ptu_count: (info.ptu_count as string | number | null | undefined) ?? null,
    cost_per_ptu_per_hour: (info.cost_per_ptu_per_hour as string | number | null | undefined) ?? null,
    ptu_effective_from: utcIsoToPickerValue(info.ptu_effective_from as string | null | undefined),
    ptu_effective_to: utcIsoToPickerValue(info.ptu_effective_to as string | null | undefined),
  };
}

function buildExtraParams(model: ModelData): string {
  const visibleParams = Object.fromEntries(
    Object.entries(model.litellm_params).filter(
      ([key, value]) => key !== "litellm_credential_name" && !isMaskedSecret(value),
    ),
  );
  return JSON.stringify(visibleParams, null, 2);
}

export function toModelEditFormValues(model: ModelData, isWildcardModel: boolean): ModelEditFormValues {
  const params = model.litellm_params;
  const info = model.model_info;
  const vectorStoreIds = stringArray(params.vector_store_ids);
  const cacheControlInjectionPoints = Array.isArray(params.cache_control_injection_points)
    ? (params.cache_control_injection_points as FocusCacheControlInjectionPoint[])
    : [];
  return {
    model_name: model.model_name,
    litellm_model_name: model.litellm_model_name,
    api_base: params.api_base,
    custom_llm_provider: params.custom_llm_provider,
    organization: params.organization,
    tpm: params.tpm,
    rpm: params.rpm,
    max_retries: params.max_retries,
    timeout: params.timeout,
    stream_timeout: params.stream_timeout,
    ...buildPricingValues(model),
    ...buildPtuValues(model),
    cache_control: cacheControlInjectionPoints.length > 0,
    cache_control_injection_points: cacheControlInjectionPoints,
    model_access_group: stringArray(info.access_groups),
    guardrails: stringArray(params.guardrails),
    vector_store_ids: vectorStoreIds.length > 0 ? vectorStoreIds : undefined,
    tags: stringArray(params.tags),
    ...(isWildcardModel ? { health_check_model: info.health_check_model as string | null | undefined } : {}),
    litellm_credential_name: params.litellm_credential_name ?? "",
    litellm_extra_params: buildExtraParams(model),
    model_info: JSON.stringify(info, null, 2),
  };
}

interface FocusModelEditFormProps {
  model: ModelData;
  teamAlias: string | null;
  accessToken: string;
  isSaving: boolean;
  isWildcardModel: boolean;
  isPtuEnabled: boolean;
  showCacheControl: boolean;
  setShowCacheControl: (isVisible: boolean) => void;
  onCancel: () => void;
  onSubmit: (values: ModelEditFormValues, isFieldTouched: (field: TouchedPricingField) => boolean) => Promise<void>;
  modelAccessGroups: string[];
  guardrails: string[];
  tags: Record<string, Tag>;
  credentials: CredentialItem[];
  healthCheckModelOptions: { value: string; label: string }[];
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Hint({ text, href }: { text: string; href?: string }) {
  const icon = <CircleHelp className="ml-1 inline size-3.5 shrink-0 cursor-help text-muted-foreground" />;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} />
          ) : (
            icon
          )
        }
      >
        {href ? icon : null}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

export function FocusModelEditForm({
  model,
  teamAlias,
  accessToken,
  isSaving,
  isWildcardModel,
  isPtuEnabled,
  showCacheControl,
  setShowCacheControl,
  onCancel,
  onSubmit,
  modelAccessGroups,
  guardrails,
  tags,
  credentials,
  healthCheckModelOptions,
}: FocusModelEditFormProps) {
  const { t } = useTranslation("gateway");
  const touchedFields = useRef<ReadonlySet<string>>(new Set());
  const isFieldTouched = useCallback((field: TouchedPricingField) => touchedFields.current.has(field), []);
  const resolver: Resolver<ModelEditFormValues> = (values, context, options) =>
    zodResolver(buildSchema(isPtuEnabled, isFieldTouched, t))(values, context, options);
  const form = useForm<ModelEditFormValues>({
    resolver,
    defaultValues: toModelEditFormValues(model, isWildcardModel),
  });
  const markTouched = (field: string) => {
    touchedFields.current = new Set([...touchedFields.current, field]);
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) =>
    form.handleSubmit((values) => onSubmit(values, isFieldTouched))(event);
  const cancel = () => {
    form.reset(toModelEditFormValues(model, isWildcardModel));
    touchedFields.current = new Set();
    onCancel();
  };
  const textField = (name: ModelEditFieldName, label: string, placeholder: string) => (
    <FormField control={form.control} name={name} label={label}>
      {({ value, ...control }) => <Input {...control} value={(value as string) ?? ""} placeholder={placeholder} />}
    </FormField>
  );
  const numberField = (name: ModelEditFieldName, label: string, placeholder: string) => (
    <FormField control={form.control} name={name} label={label}>
      {({ value, ...control }) => <NumericalInput {...control} value={value ?? ""} placeholder={placeholder} />}
    </FormField>
  );
  const pricingField = (name: TouchedPricingField, label: string, placeholder: string, description?: string) => (
    <FormField control={form.control} name={name} label={label} description={description}>
      {({ value, onChange, ...control }) => (
        <NumericalInput
          {...control}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            markTouched(name);
            onChange(event);
          }}
        />
      )}
    </FormField>
  );
  const tagsField = (
    name: "model_access_group" | "guardrails" | "tags",
    options: { value: string; label: string }[],
    placeholder: string,
  ) => (
    <FormField control={form.control} name={name}>
      {({ id, value, onChange }) => (
        <TagsInput
          id={id}
          value={(value as string[]) ?? []}
          onValueChange={onChange}
          options={options}
          placeholder={placeholder}
          emptyText={t("models.editor.noMatchingOptions")}
          tokenSeparators={[","]}
        />
      )}
    </FormField>
  );

  return (
    <TooltipProvider>
      <form onSubmit={submit} className="space-y-4">
        <FormSection
          title={t("models.editor.sections.identity")}
          description={t("models.editor.sections.identityDescription")}
        >
          {textField("model_name", t("models.editor.fields.publicName"), t("models.editor.placeholders.publicName"))}
          {textField(
            "litellm_model_name",
            t("models.editor.fields.providerModel"),
            t("models.editor.placeholders.providerModel"),
          )}
          {textField("api_base", t("models.editor.fields.apiBase"), t("models.editor.placeholders.apiBase"))}
          {textField(
            "custom_llm_provider",
            t("models.editor.fields.provider"),
            t("models.editor.placeholders.provider"),
          )}
          {textField(
            "organization",
            t("models.editor.fields.organization"),
            t("models.editor.placeholders.organization"),
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{t("models.editor.fields.team")}</p>
            <div className="mt-2 rounded-md bg-muted px-3 py-2 text-sm">
              {teamAlias
                ? `${teamAlias} (${model.model_info?.team_id})`
                : model.model_info?.team_id || t("models.editor.notSet")}
            </div>
          </div>
        </FormSection>

        <FormSection
          title={t("models.editor.sections.limits")}
          description={t("models.editor.sections.limitsDescription")}
        >
          {numberField("tpm", t("models.editor.fields.tpm"), t("models.editor.placeholders.tpm"))}
          {numberField("rpm", t("models.editor.fields.rpm"), t("models.editor.placeholders.rpm"))}
          {numberField("max_retries", t("models.editor.fields.maxRetries"), t("models.editor.placeholders.maxRetries"))}
          {numberField("timeout", t("models.editor.fields.timeout"), t("models.editor.placeholders.timeout"))}
          {numberField(
            "stream_timeout",
            t("models.editor.fields.streamTimeout"),
            t("models.editor.placeholders.streamTimeout"),
          )}
        </FormSection>

        <FormSection
          title={t("models.editor.sections.pricing")}
          description={t("models.editor.sections.pricingDescription")}
        >
          {pricingField("input_cost", t("models.editor.fields.inputCost"), t("models.editor.placeholders.inputCost"))}
          {pricingField(
            "output_cost",
            t("models.editor.fields.outputCost"),
            t("models.editor.placeholders.outputCost"),
          )}
          {pricingField(
            "cache_read_cost",
            t("models.editor.fields.cacheReadCost"),
            t("models.editor.placeholders.defaultInputCost"),
            t("models.editor.hints.defaultInputCost"),
          )}
          {pricingField(
            "cache_write_cost",
            t("models.editor.fields.cacheWriteCost"),
            t("models.editor.placeholders.defaultInputCost"),
            t("models.editor.hints.defaultInputCost"),
          )}
          {isPtuEnabled && (
            <>
              {numberField("ptu_count", t("models.editor.fields.ptuCount"), t("models.editor.placeholders.ptuCount"))}
              {numberField(
                "cost_per_ptu_per_hour",
                t("models.editor.fields.ptuRate"),
                t("models.editor.placeholders.ptuRate"),
              )}
              <FormField control={form.control} name="ptu_effective_from" label={t("models.editor.fields.ptuStart")}>
                {({ value, onChange, ...control }) => (
                  <UtcDateTimeInput {...control} value={value as Dayjs | null} onChange={onChange} />
                )}
              </FormField>
              <FormField control={form.control} name="ptu_effective_to" label={t("models.editor.fields.ptuEnd")}>
                {({ value, onChange, ...control }) => (
                  <UtcDateTimeInput {...control} value={value as Dayjs | null} onChange={onChange} />
                )}
              </FormField>
            </>
          )}
        </FormSection>

        <FormSection
          title={t("models.editor.sections.routing")}
          description={t("models.editor.sections.routingDescription")}
        >
          <div>
            <p className="mb-2 text-sm font-medium">{t("models.editor.fields.accessGroups")}</p>
            {tagsField(
              "model_access_group",
              modelAccessGroups.map((group) => ({ value: group, label: group })),
              t("models.editor.placeholders.accessGroups"),
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">
              {t("models.editor.fields.guardrails")}
              <Hint
                text={t("models.editor.hints.guardrails")}
                href="https://docs.litellm.ai/docs/proxy/guardrails/quick_start"
              />
            </p>
            {tagsField(
              "guardrails",
              guardrails.map((name) => ({ value: name, label: name })),
              t("models.editor.placeholders.guardrails"),
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">{t("models.editor.fields.tags")}</p>
            {tagsField(
              "tags",
              Object.values(tags).map((tag) => ({ value: tag.name, label: tag.name })),
              t("models.editor.placeholders.tags"),
            )}
          </div>
          <FormField control={form.control} name="vector_store_ids" label={t("models.editor.fields.knowledgeBases")}>
            {({ value, onChange }) => (
              <VectorStoreSelector
                value={value as string[] | undefined}
                onChange={onChange}
                accessToken={accessToken}
                placeholder={t("models.editor.placeholders.knowledgeBases")}
              />
            )}
          </FormField>
          <FormField
            control={form.control}
            name="litellm_credential_name"
            label={t("models.editor.fields.credentials")}
          >
            {({ id, value, onChange, onBlur }) => {
              const items = [
                { value: "", label: t("models.editor.none") },
                ...credentials.map((credential) => ({
                  value: credential.credential_name,
                  label: credential.credential_name,
                })),
              ];
              return (
                <Select
                  items={items}
                  value={(value as string) ?? ""}
                  onValueChange={(selected) => onChange(selected ?? "")}
                >
                  <SelectTrigger id={id} className="w-full" onBlur={onBlur}>
                    <SelectValue placeholder={t("models.editor.placeholders.credentials")} />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          </FormField>
          {isWildcardModel && (
            <FormField
              control={form.control}
              name="health_check_model"
              label={t("models.editor.fields.healthCheckModel")}
            >
              {({ id, value, onChange, onBlur }) => (
                <Select
                  items={healthCheckModelOptions}
                  value={(value as string | null) ?? null}
                  onValueChange={onChange}
                >
                  <SelectTrigger id={id} className="w-full" onBlur={onBlur}>
                    <SelectValue placeholder={t("models.editor.placeholders.healthCheckModel")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>{t("models.editor.none")}</SelectItem>
                    {healthCheckModelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          )}
        </FormSection>

        <FormSection
          title={t("models.editor.sections.cache")}
          description={t("models.editor.sections.cacheDescription")}
        >
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="cache_control"
              label={t("models.editor.fields.cacheControl")}
              orientation="horizontal"
            >
              {({ id, value, onChange, onBlur }) => (
                <Switch
                  id={id}
                  onBlur={onBlur}
                  checked={Boolean(value)}
                  onCheckedChange={(isChecked) => {
                    onChange(isChecked);
                    setShowCacheControl(isChecked);
                  }}
                />
              )}
            </FormField>
          </div>
          {showCacheControl && (
            <div className="sm:col-span-2">
              <FormField control={form.control} name="cache_control_injection_points">
                {({ value, onChange }) => (
                  <FocusCacheControlInjectionPoints
                    value={(value as FocusCacheControlInjectionPoint[]) ?? []}
                    onChange={onChange}
                  />
                )}
              </FormField>
            </div>
          )}
        </FormSection>

        <FormSection
          title={t("models.editor.sections.advanced")}
          description={t("models.editor.sections.advancedDescription")}
        >
          <FormField control={form.control} name="model_info" label={t("models.editor.fields.modelInfo")}>
            {({ value, ...control }) => (
              <Textarea {...control} value={(value as string) ?? ""} rows={10} className="font-mono text-xs" />
            )}
          </FormField>
          <FormField
            control={form.control}
            name="litellm_extra_params"
            label={
              <>
                {t("models.editor.fields.extraParams")}
                <Hint
                  text={t("models.editor.hints.extraParams")}
                  href="https://docs.litellm.ai/docs/completion/input"
                />
              </>
            }
          >
            {({ value, ...control }) => (
              <Textarea {...control} value={(value as string) ?? ""} rows={10} className="font-mono text-xs" />
            )}
          </FormField>
        </FormSection>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-background/95 py-4 backdrop-blur">
          <Button type="button" variant="outline" onClick={cancel} disabled={isSaving}>
            {t("models.editor.cancel")}
          </Button>
          <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
            {isSaving && <UiLoadingSpinner className="size-4" />}
            {isSaving ? t("models.editor.saving") : t("models.editor.save")}
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
}
