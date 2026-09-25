import { useProviderFields } from "@/app/(dashboard)/hooks/providers/useProviderFields";
import {
  isJsonCredentialFile,
  isProviderCredentialFieldRequired,
  JSON_CREDENTIAL_FILE_ACCEPT,
  providerCredentialDefaultValue,
  readProviderCredentialFile,
  resolveProviderCredentialFields,
  useApiVersionInference,
  type ProviderCredentialField,
} from "@/features/models-and-endpoints/providerCredentialContract";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";
import {
  MountedFormField,
  type MountedFieldControlProps,
  type MountedFormValues,
} from "../common_components/MountedFormField";
import { Providers } from "../provider_info_helpers";
import { labelWithHint } from "@/components/shared/form/LabelWithHint";

interface ProviderSpecificFieldsProps {
  selectedProvider: string | null;
}

const ProviderSpecificFields: React.FC<ProviderSpecificFieldsProps> = ({ selectedProvider }) => {
  const selectedProviderEnum = Providers[selectedProvider as keyof typeof Providers] as Providers;
  const form = useFormContext<MountedFormValues>();
  const credentialsFileRef = React.useRef<HTMLInputElement>(null);
  const pickCredentialsFile =
    (onLoaded: (contents: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file && isJsonCredentialFile(file)) {
        readProviderCredentialFile(file, onLoaded);
      }
    };

  const { data: providerMetadata, isLoading, error: loadError } = useProviderFields();

  const allFields = React.useMemo(
    () => resolveProviderCredentialFields(providerMetadata, selectedProviderEnum, selectedProvider),
    [providerMetadata, selectedProvider, selectedProviderEnum],
  );
  const handleApiBaseChange = useApiVersionInference(allFields, {
    getValue: (field) => form.getValues(field),
    setValue: (field, value) => form.setValue(field, value),
  });

  const renderFieldControl = (field: ProviderCredentialField, control: MountedFieldControlProps) => {
    if (field.field_type === "select") {
      return (
        <Select
          items={field.options.map((option) => ({ value: option, label: option }))}
          value={(control.value as string | undefined) ?? providerCredentialDefaultValue(field) ?? null}
          onValueChange={control.onChange}
        >
          <SelectTrigger id={control.id} onBlur={control.onBlur} className="w-full">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.field_type === "upload") {
      return (
        <>
          <Button type="button" variant="outline" className="w-fit" onClick={() => credentialsFileRef.current?.click()}>
            <UploadIcon />
            Click to Upload
          </Button>
          <input
            ref={credentialsFileRef}
            id={control.id}
            type="file"
            accept={JSON_CREDENTIAL_FILE_ACCEPT}
            className="sr-only"
            onBlur={control.onBlur}
            onChange={pickCredentialsFile(control.onChange)}
          />
        </>
      );
    }

    if (field.field_type === "textarea") {
      return (
        <Textarea
          id={control.id}
          value={control.value as string | undefined}
          onChange={control.onChange}
          onBlur={control.onBlur}
          placeholder={field.placeholder ?? undefined}
          defaultValue={providerCredentialDefaultValue(field)}
          rows={6}
          className="font-mono text-xs"
        />
      );
    }

    if (field.field_type === "password") {
      return (
        <PasswordInput
          id={control.id}
          value={control.value as string | undefined}
          onChange={control.onChange}
          onBlur={control.onBlur}
          placeholder={field.placeholder ?? undefined}
          defaultValue={providerCredentialDefaultValue(field)}
        />
      );
    }

    return (
      <Input
        id={control.id}
        value={(control.value as string | undefined) ?? undefined}
        onBlur={control.onBlur}
        placeholder={field.placeholder ?? undefined}
        type="text"
        defaultValue={providerCredentialDefaultValue(field)}
        onChange={(event) => {
          control.onChange(event);
          if (field.key === "api_base") {
            handleApiBaseChange(event.target.value);
          }
        }}
      />
    );
  };

  return (
    <>
      {isLoading && allFields.length === 0 && <p className="text-sm mb-2">Loading provider fields...</p>}
      {loadError && allFields.length === 0 && (
        <p className="text-sm mb-2 text-destructive">
          {loadError instanceof Error ? loadError.message : "Failed to load provider credential fields"}
        </p>
      )}
      {allFields.map((field) => (
        <React.Fragment key={field.key}>
          <MountedFormField
            label={field.tooltip ? labelWithHint(field.label, field.tooltip) : field.label}
            name={field.key}
            required={field.required}
            rules={
              field.required
                ? { validate: { required: (value) => (isProviderCredentialFieldRequired(value) ? true : "Required") } }
                : undefined
            }
            className={field.key === "vertex_credentials" ? "mb-0" : "mb-4"}
          >
            {(control) => renderFieldControl(field, control)}
          </MountedFormField>

          {/* Special case for Vertex Credentials help text */}
          {field.key === "vertex_credentials" && (
            <p className="text-sm mb-3 mt-1">Give a gcp service account(.json file)</p>
          )}

          {/* Special case for Azure Base Model help text */}
          {field.key === "base_model" && (
            <div className="grid grid-cols-24">
              <p className="col-start-11 col-span-10 text-sm mb-2">
                The actual model your azure deployment uses. Used for accurate cost tracking. Select name from{" "}
                <a
                  href="https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  here
                </a>
              </p>
            </div>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default ProviderSpecificFields;
