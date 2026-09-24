"use client";

import type { Tag } from "@/components/tag_management/types";
import { MountedFormField } from "@/components/common_components/MountedFormField";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { UtcDateTimeInput } from "@/components/shared/form/UtcDateTimeInput";
import VectorStoreSelector from "@/components/vector_store_management/VectorStoreSelector";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FocusCacheControlInjectionPoints,
  type FocusCacheControlInjectionPoint,
} from "./FocusCacheControlInjectionPoints";

interface FocusAddModelAdvancedSettingsProps {
  accessToken: string;
  isPtuEnabled: boolean;
  guardrails: string[];
  tags: Record<string, Tag>;
}

function NumberField({
  name,
  label,
  placeholder,
  validationMessage,
}: {
  name: string;
  label: string;
  placeholder?: string;
  validationMessage: string;
}) {
  const nonNegativeNumber = (value: unknown): string | true => {
    if (value == null || value === "") return true;
    return Number.isFinite(Number(value)) && Number(value) >= 0 ? true : validationMessage;
  };
  return (
    <MountedFormField name={name} label={label} rules={{ validate: { number: nonNegativeNumber } }}>
      {(control) => (
        <Input
          id={control.id}
          type="number"
          min={0}
          step="any"
          value={(control.value as string | number | undefined) ?? ""}
          onChange={control.onChange}
          onBlur={control.onBlur}
          placeholder={placeholder}
        />
      )}
    </MountedFormField>
  );
}

export function FocusAddModelAdvancedSettings({
  accessToken,
  isPtuEnabled,
  guardrails,
  tags,
}: FocusAddModelAdvancedSettingsProps) {
  const { t } = useTranslation("gateway");
  const [isCustomPricing, setIsCustomPricing] = useState(false);
  const numberValidationMessage = t("models.create.validation.nonNegativeNumber");
  const validJson = (value: unknown): string | true => {
    if (value == null || value === "") return true;
    if (typeof value !== "string") return t("models.create.validation.validJson");
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed != null && typeof parsed === "object" && !Array.isArray(parsed)
        ? true
        : t("models.create.validation.jsonObjectValue");
    } catch {
      return t("models.create.validation.validJson");
    }
  };
  const [pricingModel, setPricingModel] = useState<"per_token" | "per_second">("per_token");
  const [isCacheControlEnabled, setIsCacheControlEnabled] = useState(false);
  const handlePricingModelChange = (onChange: (...event: unknown[]) => void, value: string | null) => {
    if (value !== "per_token" && value !== "per_second") return;
    onChange(value);
    setPricingModel(value);
  };

  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-lg border border-border bg-background p-4">
        <div>
          <h3 className="text-sm font-semibold">{t("models.create.sections.routing")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("models.create.sections.routingDescription")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MountedFormField name="guardrails" label={t("models.editor.fields.guardrails")}>
            {(control) => (
              <MultiSelect
                id={control.id}
                value={(control.value as string[] | undefined) ?? []}
                onValueChange={control.onChange}
                options={guardrails.map((name) => ({ value: name, label: name }))}
                placeholder={t("models.editor.placeholders.guardrails")}
                emptyText={t("models.editor.noMatchingOptions")}
                allowCustomValues
              />
            )}
          </MountedFormField>
          <MountedFormField name="tags" label={t("models.editor.fields.tags")}>
            {(control) => (
              <MultiSelect
                id={control.id}
                value={(control.value as string[] | undefined) ?? []}
                onValueChange={control.onChange}
                options={Object.values(tags).map((tag) => ({
                  value: tag.name,
                  label: tag.name,
                  description: tag.description || undefined,
                }))}
                placeholder={t("models.editor.placeholders.tags")}
                emptyText={t("models.editor.noMatchingOptions")}
                allowCustomValues
              />
            )}
          </MountedFormField>
          <MountedFormField name="vector_store_ids" label={t("models.editor.fields.knowledgeBases")}>
            {(control) => (
              <VectorStoreSelector
                value={control.value as string[] | undefined}
                onChange={control.onChange}
                accessToken={accessToken}
                placeholder={t("models.editor.placeholders.knowledgeBases")}
              />
            )}
          </MountedFormField>
          <MountedFormField name="use_in_pass_through" label={t("models.create.useInPassThrough")}>
            {(control) => (
              <Switch id={control.id} checked={control.value === true} onCheckedChange={control.onChange} />
            )}
          </MountedFormField>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-background p-4">
        <div>
          <h3 className="text-sm font-semibold">{t("models.editor.sections.pricing")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("models.editor.sections.pricingDescription")}</p>
        </div>
        <MountedFormField name="custom_pricing" label={t("models.create.customPricing")}>
          {(control) => (
            <Switch
              id={control.id}
              checked={control.value === true}
              onCheckedChange={(checked) => {
                control.onChange(checked);
                setIsCustomPricing(checked);
              }}
            />
          )}
        </MountedFormField>
        {isCustomPricing && (
          <div className="grid gap-4 border-l-2 border-border pl-4 sm:grid-cols-2">
            <MountedFormField name="pricing_model" label={t("models.create.pricingModel")} defaultValue="per_token">
              {(control) => (
                <Select
                  items={[
                    { value: "per_token", label: t("models.create.perMillionTokens") },
                    { value: "per_second", label: t("models.create.perSecond") },
                  ]}
                  value={(control.value as "per_token" | "per_second" | undefined) ?? "per_token"}
                  onValueChange={(value) => handlePricingModelChange(control.onChange, value)}
                >
                  <SelectTrigger id={control.id} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_token">{t("models.create.perMillionTokens")}</SelectItem>
                    <SelectItem value="per_second">{t("models.create.perSecond")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </MountedFormField>
            {pricingModel === "per_token" ? (
              <>
                <NumberField
                  name="input_cost_per_token"
                  label={t("models.editor.fields.inputCost")}
                  validationMessage={numberValidationMessage}
                />
                <NumberField
                  name="output_cost_per_token"
                  label={t("models.editor.fields.outputCost")}
                  validationMessage={numberValidationMessage}
                />
                <NumberField
                  name="cache_read_input_token_cost"
                  label={t("models.editor.fields.cacheReadCost")}
                  validationMessage={numberValidationMessage}
                />
                <NumberField
                  name="cache_creation_input_token_cost"
                  label={t("models.editor.fields.cacheWriteCost")}
                  validationMessage={numberValidationMessage}
                />
              </>
            ) : (
              <NumberField
                name="input_cost_per_second"
                label={t("models.create.costPerSecond")}
                validationMessage={numberValidationMessage}
              />
            )}
          </div>
        )}
        {isPtuEnabled && (
          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <NumberField
              name="ptu_count"
              label={t("models.editor.fields.ptuCount")}
              placeholder="15"
              validationMessage={numberValidationMessage}
            />
            <NumberField
              name="cost_per_ptu_per_hour"
              label={t("models.editor.fields.ptuRate")}
              placeholder="2.00"
              validationMessage={numberValidationMessage}
            />
            <MountedFormField name="ptu_effective_from" label={t("models.editor.fields.ptuStart")}>
              {(control) => (
                <UtcDateTimeInput
                  id={control.id}
                  value={control.value as Dayjs | null}
                  onChange={control.onChange}
                  onBlur={control.onBlur}
                />
              )}
            </MountedFormField>
            <MountedFormField name="ptu_effective_to" label={t("models.editor.fields.ptuEnd")}>
              {(control) => (
                <UtcDateTimeInput
                  id={control.id}
                  value={control.value as Dayjs | null}
                  onChange={control.onChange}
                  onBlur={control.onBlur}
                />
              )}
            </MountedFormField>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-background p-4">
        <div>
          <h3 className="text-sm font-semibold">{t("models.editor.sections.cache")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("models.editor.sections.cacheDescription")}</p>
        </div>
        <MountedFormField name="cache_control" label={t("models.editor.fields.cacheControl")}>
          {(control) => (
            <Switch
              id={control.id}
              checked={control.value === true}
              onCheckedChange={(checked) => {
                control.onChange(checked);
                setIsCacheControlEnabled(checked);
              }}
            />
          )}
        </MountedFormField>
        {isCacheControlEnabled && (
          <MountedFormField name="cache_control_injection_points" defaultValue={[{ location: "message" }]} bare>
            {(control) => (
              <FocusCacheControlInjectionPoints
                value={control.value as FocusCacheControlInjectionPoint[] | undefined}
                onChange={control.onChange}
              />
            )}
          </MountedFormField>
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-background p-4">
        <div>
          <h3 className="text-sm font-semibold">{t("models.editor.sections.advanced")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("models.editor.sections.advancedDescription")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MountedFormField
            name="litellm_extra_params"
            label={t("models.editor.fields.extraParams")}
            rules={{ validate: { json: validJson } }}
          >
            {(control) => (
              <Textarea
                id={control.id}
                value={(control.value as string | undefined) ?? ""}
                onChange={control.onChange}
                onBlur={control.onBlur}
                rows={8}
                className="font-mono text-xs"
                placeholder={'{\n  "rpm": 100,\n  "timeout": 30\n}'}
              />
            )}
          </MountedFormField>
          <MountedFormField
            name="model_info_params"
            label={t("models.editor.fields.modelInfo")}
            rules={{ validate: { json: validJson } }}
          >
            {(control) => (
              <Textarea
                id={control.id}
                value={(control.value as string | undefined) ?? ""}
                onChange={control.onChange}
                onBlur={control.onBlur}
                rows={8}
                className="font-mono text-xs"
                placeholder={'{\n  "mode": "chat"\n}'}
              />
            )}
          </MountedFormField>
        </div>
      </section>
    </div>
  );
}
