import type { ProviderCreateInfo, ProviderCredentialFieldMetadata } from "@/components/networking";
import { useCallback, useMemo, useRef } from "react";

type ProviderFieldType = NonNullable<ProviderCredentialFieldMetadata["field_type"]>;

export type ProviderCredentialField = Omit<ProviderCredentialFieldMetadata, "field_type" | "required" | "options"> & {
  readonly field_type: ProviderFieldType;
  readonly required: boolean;
  readonly options: readonly string[];
};

export const JSON_CREDENTIAL_FILE_ACCEPT = ".json,application/json";

const isBlank = (value: unknown): boolean => value === undefined || value === null || value === "";

const normalizeField = (field: ProviderCredentialFieldMetadata): ProviderCredentialField => ({
  ...field,
  field_type: field.field_type ?? "text",
  required: field.required ?? false,
  options: field.options ?? [],
});

const matchesProvider = (provider: ProviderCreateInfo, identifier: string): boolean =>
  provider.provider === identifier ||
  provider.provider_display_name === identifier ||
  provider.litellm_provider === identifier;

export const resolveProviderCredentialMetadata = (
  providers: readonly ProviderCreateInfo[] | undefined,
  ...identifiers: readonly (string | null | undefined)[]
): ProviderCreateInfo | undefined => {
  const providerIdentifiers = identifiers.filter((identifier): identifier is string => Boolean(identifier));
  return providers?.find((provider) => providerIdentifiers.some((identifier) => matchesProvider(provider, identifier)));
};

export const resolveProviderCredentialFields = (
  providers: readonly ProviderCreateInfo[] | undefined,
  ...identifiers: readonly (string | null | undefined)[]
): readonly ProviderCredentialField[] =>
  resolveProviderCredentialMetadata(providers, ...identifiers)?.credential_fields.map(normalizeField) ?? [];

export const providerCredentialDefaultValue = (field: ProviderCredentialField): string | undefined =>
  field.default_value ?? undefined;

export const providerCredentialDefaultValues = (
  fields: readonly ProviderCredentialField[],
): Record<string, string> =>
  Object.fromEntries(
    fields.flatMap((field) => {
      const value = providerCredentialDefaultValue(field);
      return value === undefined ? [] : [[field.key, value]];
    }),
  );

export const isProviderCredentialFieldRequired = (value: unknown): boolean =>
  !isBlank(value) && (!Array.isArray(value) || value.length > 0);

export const isJsonCredentialFile = (file: File): boolean =>
  file.type === "application/json" || file.name.toLowerCase().endsWith(".json");

export const readProviderCredentialFile = (file: File, onLoaded: (contents: string) => void): void => {
  const reader = new FileReader();
  reader.onload = () => onLoaded(String(reader.result ?? ""));
  reader.readAsText(file);
};

export const apiVersionFromApiBase = (apiBase: string): string | null => {
  const queryStartIndex = apiBase.indexOf("?");
  if (queryStartIndex === -1) return null;
  const queryString = apiBase.slice(queryStartIndex + 1).split("#")[0];
  const searchParams = new URLSearchParams(queryString);
  return searchParams.get("api_version") || searchParams.get("api-version");
};

export interface ProviderCredentialFormAdapter {
  readonly getValue: (field: string) => unknown;
  readonly setValue: (field: string, value: string) => void;
}

export interface ProviderCredentialResetAdapter {
  readonly getFieldValue: (field: string) => unknown;
  readonly resetFields: () => void;
  readonly setFieldValue: (field: string, value: unknown) => void;
}

export const resetProviderCredentialFormOnProviderChange = (
  form: ProviderCredentialResetAdapter,
  newProvider: string | null,
  setSelectedProvider: (provider: string | null) => void,
  fields: readonly ProviderCredentialField[] = [],
): void => {
  const credentialName = form.getFieldValue("credential_name");
  form.resetFields();
  if (credentialName !== undefined) form.setFieldValue("credential_name", credentialName);
  setSelectedProvider(newProvider);
  form.setFieldValue("custom_llm_provider", newProvider);
  for (const [field, value] of Object.entries(providerCredentialDefaultValues(fields))) {
    form.setFieldValue(field, value);
  }
};

export const useApiVersionInference = (
  fields: readonly ProviderCredentialField[],
  form: ProviderCredentialFormAdapter,
): ((apiBase: string) => void) => {
  const hasApiVersionField = useMemo(() => fields.some((field) => field.key === "api_version"), [fields]);
  const lastInferredApiVersionRef = useRef<string | null>(null);

  return useCallback(
    (apiBase: string) => {
      if (!hasApiVersionField) return;
      const apiVersion = apiVersionFromApiBase(apiBase);
      if (apiVersion) {
        lastInferredApiVersionRef.current = apiVersion;
        form.setValue("api_version", apiVersion);
        return;
      }
      if (form.getValue("api_version") === lastInferredApiVersionRef.current) {
        form.setValue("api_version", "");
      }
      lastInferredApiVersionRef.current = null;
    },
    [form, hasApiVersionField],
  );
};
