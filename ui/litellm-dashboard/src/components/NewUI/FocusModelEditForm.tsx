"use client";

import { TagsInput } from "@/app/(dashboard)/guardrails/_components/content_filter/TagsInput";
import type { ModelData } from "@/components/model_dashboard/types";
import type { CredentialItem } from "@/components/networking";
import { FormField } from "@/components/shared/form/FormField";
import { UtcDateTimeInput } from "@/components/shared/form/UtcDateTimeInput";
import TeamDropdown from "@/components/common_components/team_dropdown";
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
import {
  buildModelEditSchema,
  initializeModelEditForm,
  type ModelFormValues,
  type ModelFormValidationMessages,
  type TouchedPricingField,
} from "@/features/models-and-endpoints/modelFormContract";
import { MAX_COST_PER_PTU_PER_HOUR, MAX_PTU_COUNT } from "@/utils/ptuValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dayjs } from "dayjs";
import { CircleHelp } from "lucide-react";
import { useCallback, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FocusCacheControlInjectionPoints,
  type FocusCacheControlInjectionPoint,
} from "./FocusCacheControlInjectionPoints";

export type ModelEditFormValues = ModelFormValues & {
  cache_control_injection_points?: FocusCacheControlInjectionPoint[];
};

type ModelEditFieldName = keyof ModelEditFormValues;

export const toModelEditFormValues = (model: ModelData, isWildcardModel: boolean): ModelEditFormValues =>
  initializeModelEditForm(model, isWildcardModel, { includeModelInfo: true }) as ModelEditFormValues;

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
  const validationMessages: ModelFormValidationMessages = {
    validJson: t("models.editor.validation.validJson"),
    ptuCount: t("models.editor.validation.ptuCount", { max: MAX_PTU_COUNT.toLocaleString() }),
    ptuRate: t("models.editor.validation.ptuRate", { max: MAX_COST_PER_PTU_PER_HOUR.toLocaleString() }),
    ptuPair: t("models.editor.validation.ptuPair"),
    ptuStartRequired: t("models.editor.validation.ptuStartRequired"),
    ptuOrder: t("models.editor.validation.ptuOrder"),
    ptuPricing: t("models.editor.validation.ptuPricing"),
  };
  const resolver: Resolver<ModelEditFormValues> = (values, context, options) =>
    zodResolver(buildModelEditSchema({ isPtuEnabled, isFieldTouched, messages: validationMessages }))(
      values,
      context,
      options,
    );
  const form = useForm<ModelEditFormValues>({
    resolver,
    defaultValues: initializeModelEditForm(model, isWildcardModel, { includeModelInfo: true }) as ModelEditFormValues,
  });
  const markTouched = (field: string) => {
    touchedFields.current = new Set([...touchedFields.current, field]);
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) =>
    form.handleSubmit((values) => onSubmit(values, isFieldTouched))(event);
  const cancel = () => {
    form.reset(initializeModelEditForm(model, isWildcardModel, { includeModelInfo: true }) as ModelEditFormValues);
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
          <FormField
            control={form.control}
            name="team_id"
            label={t("models.editor.fields.team")}
            description={teamAlias ?? undefined}
          >
            {({ id, value, onChange }) => (
              <TeamDropdown id={id} value={(value as string | null | undefined) ?? null} onChange={onChange} />
            )}
          </FormField>
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
