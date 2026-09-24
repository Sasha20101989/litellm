"use client";

import type { ProviderCredentialFieldMetadata } from "@/components/networking";
import { MountedFormField, type MountedFieldControlProps } from "@/components/common_components/MountedFormField";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

interface FocusProviderCredentialFieldsProps {
  fields: ProviderCredentialFieldMetadata[];
  provider?: string;
}

function isTechnicalPlaceholder(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^(https?:\/\/|[a-z]+-|ocid|[a-z]{2}-[a-z]+-\d|\d|-----BEGIN)/i.test(value);
}

function getMetadataCopy(
  field: ProviderCredentialFieldMetadata,
  provider: string | undefined,
  isRussian: boolean,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const fieldPath = `models.create.providerFields.${field.key}`;
  const providerPath = `models.create.providerFieldOverrides.${provider}.${field.key}`;
  const providerLabel = t(`${providerPath}.label`, { defaultValue: "" });
  const providerTooltip = t(`${providerPath}.tooltip`, { defaultValue: "" });
  const providerPlaceholder = t(`${providerPath}.placeholder`, { defaultValue: "" });
  const fallbackTooltip = isRussian ? "" : field.tooltip ?? "";
  const fallbackPlaceholder = isRussian && !isTechnicalPlaceholder(field.placeholder) ? "" : field.placeholder ?? "";
  return {
    label: providerLabel || t(`${fieldPath}.label`, { defaultValue: field.label }),
    tooltip: providerTooltip || t(`${fieldPath}.tooltip`, { defaultValue: fallbackTooltip }) || undefined,
    placeholder:
      providerPlaceholder || t(`${fieldPath}.placeholder`, { defaultValue: fallbackPlaceholder }) || undefined,
  };
}

function ProviderFieldControl({
  field,
  control,
}: {
  field: ProviderCredentialFieldMetadata;
  control: MountedFieldControlProps;
}) {
  const { t } = useTranslation("gateway");
  const fileInput = useRef<HTMLInputElement>(null);
  const value = typeof control.value === "string" ? control.value : field.default_value ?? "";
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => control.onChange(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  if (field.field_type === "select") {
    const items = (field.options ?? []).map((option) => ({ value: option, label: option }));
    return (
      <Select items={items} value={value || null} onValueChange={control.onChange}>
        <SelectTrigger id={control.id} className="w-full" onBlur={control.onBlur}>
          <SelectValue placeholder={field.placeholder ?? t("models.create.providerFieldPlaceholder")} />
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
  }

  if (field.field_type === "upload") {
    return (
      <>
        <Button type="button" variant="outline" className="w-fit" onClick={() => fileInput.current?.click()}>
          <Upload className="size-4" />
          {value ? t("models.create.replaceFile") : t("models.create.uploadJson")}
        </Button>
        {value && <p className="text-xs text-success">{t("models.create.fileLoaded")}</p>}
        <input
          ref={fileInput}
          id={control.id}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onBlur={control.onBlur}
          onChange={handleFileChange}
        />
      </>
    );
  }

  if (field.field_type === "textarea") {
    return (
      <Textarea
        id={control.id}
        value={value}
        onChange={control.onChange}
        onBlur={control.onBlur}
        placeholder={field.placeholder ?? undefined}
        rows={6}
        className="font-mono text-xs"
      />
    );
  }

  if (field.field_type === "password") {
    return (
      <PasswordInput
        id={control.id}
        value={value}
        onChange={control.onChange}
        onBlur={control.onBlur}
        placeholder={field.placeholder ?? undefined}
      />
    );
  }

  return (
    <Input
      id={control.id}
      value={value}
      onChange={control.onChange}
      onBlur={control.onBlur}
      placeholder={field.placeholder ?? undefined}
    />
  );
}

export function FocusProviderCredentialFields({ fields, provider }: FocusProviderCredentialFieldsProps) {
  const { t, i18n } = useTranslation("gateway");
  const isRussian = (i18n.resolvedLanguage ?? i18n.language).startsWith("ru");

  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("models.create.noProviderFields")}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const copy = getMetadataCopy(field, provider, isRussian, t);
        const localizedField = { ...field, placeholder: copy.placeholder };
        return (
          <MountedFormField
            key={field.key}
            name={field.key}
            label={copy.label}
            help={copy.tooltip}
            required={field.required}
            defaultValue={field.default_value ?? undefined}
            rules={
              field.required
                ? {
                    validate: {
                      required: (value) =>
                        value == null || value === "" ? t("models.create.validation.required") : true,
                    },
                  }
                : undefined
            }
          >
            {(control) => <ProviderFieldControl field={localizedField} control={control} />}
          </MountedFormField>
        );
      })}
    </div>
  );
}
