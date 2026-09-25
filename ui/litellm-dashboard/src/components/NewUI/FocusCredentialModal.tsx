"use client";

import { useProviderFields } from "@/app/(dashboard)/hooks/providers/useProviderFields";
import {
  MountedFormField,
  MountedFormProvider,
  projectMountedValues,
  useMountRegistry,
  type MountedFormValues,
} from "@/components/common_components/MountedFormField";
import type { CredentialItem } from "@/components/networking";
import { ProviderLogo } from "@/components/molecules/models/ProviderLogo";
import { SearchSelect, type SearchSelectOption } from "@/components/shared/SearchSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FocusProviderCredentialFields } from "./FocusProviderCredentialFields";

interface FocusCredentialModalProps {
  open: boolean;
  mode: "add" | "edit";
  existingCredential?: CredentialItem | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}

function initialValues(existingCredential?: CredentialItem | null): MountedFormValues {
  if (!existingCredential) {
    return { credential_name: "", custom_llm_provider: "" };
  }
  return {
    credential_name: existingCredential.credential_name,
    custom_llm_provider: existingCredential.credential_info?.custom_llm_provider ?? "",
    ...Object.fromEntries(
      Object.entries(existingCredential.credential_values ?? {}).map(([key, value]) => [key, value ?? null]),
    ),
  };
}

export function FocusCredentialModal({
  open,
  mode,
  existingCredential,
  isSaving,
  onCancel,
  onSubmit,
}: FocusCredentialModalProps) {
  const { t } = useTranslation("gateway");
  const isEdit = mode === "edit";
  const { data: providerMetadata, isLoading: isLoadingProviders } = useProviderFields();
  const form = useForm<MountedFormValues>({
    mode: "onChange",
    defaultValues: initialValues(existingCredential),
  });
  const registry = useMountRegistry();
  const selectedProvider =
    (useWatch({ control: form.control, name: "custom_llm_provider" }) as string | undefined) ?? "";
  const providerOptions: SearchSelectOption[] = useMemo(
    () =>
      [...(providerMetadata ?? [])]
        .sort((left, right) => left.provider_display_name.localeCompare(right.provider_display_name))
        .map((provider) => ({
          value: provider.provider,
          label: provider.provider_display_name,
          icon: <ProviderLogo provider={provider.provider} className="size-5" />,
        })),
    [providerMetadata],
  );
  const selectedMetadata = providerMetadata?.find(
    (provider) =>
      provider.provider === selectedProvider ||
      provider.litellm_provider === selectedProvider ||
      provider.provider_display_name === selectedProvider,
  );
  const close = () => {
    form.reset(initialValues(existingCredential));
    onCancel();
  };
  const submit = async () => {
    const isValid = await form.trigger(registry.mountedNames() as string[]);
    if (!isValid) return;
    const values = projectMountedValues(registry, form.getValues);
    const populatedValues = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== "" && value !== undefined && value !== null),
    );
    await onSubmit(populatedValues);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t(isEdit ? "models.credentials.form.editTitle" : "models.credentials.form.addTitle")}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <MountedFormProvider value={{ control: form.control, registry }}>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <MountedFormField
                  name="credential_name"
                  label={t("models.credentials.form.name")}
                  required
                  rules={{
                    validate: {
                      required: (value) =>
                        typeof value === "string" && value.trim() ? true : t("models.credentials.form.nameRequired"),
                    },
                  }}
                >
                  {(control) => (
                    <Input
                      id={control.id}
                      value={typeof control.value === "string" ? control.value : ""}
                      onChange={control.onChange}
                      onBlur={control.onBlur}
                      placeholder={t("models.credentials.form.namePlaceholder")}
                      disabled={isEdit}
                    />
                  )}
                </MountedFormField>
                <MountedFormField
                  name="custom_llm_provider"
                  label={t("models.credentials.form.provider")}
                  help={t("models.credentials.form.providerTooltip")}
                  required
                  rules={{
                    validate: {
                      required: (value) =>
                        typeof value === "string" && value ? true : t("models.credentials.form.providerRequired"),
                    },
                  }}
                >
                  {(control) => (
                    <SearchSelect
                      inputId={control.id}
                      options={providerOptions}
                      value={typeof control.value === "string" ? control.value : null}
                      onValueChange={(value) => {
                        control.onChange(value ?? "");
                        if (!isEdit) {
                          const credentialName = form.getValues("credential_name");
                          form.reset({ credential_name: credentialName, custom_llm_provider: value ?? "" });
                        }
                      }}
                      placeholder={
                        isLoadingProviders ? t("models.create.loadingProviders") : t("models.create.selectProvider")
                      }
                      emptyText={t("models.create.noProviders")}
                      disabled={isEdit}
                    />
                  )}
                </MountedFormField>
              </div>

              {selectedProvider && (
                <div className="border-t border-border pt-5">
                  <FocusProviderCredentialFields
                    provider={selectedMetadata?.provider ?? selectedProvider}
                    fields={selectedMetadata?.credential_fields ?? []}
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={close} disabled={isSaving}>
                  {t("models.credentials.form.cancel")}
                </Button>
                <Button type="submit" disabled={isSaving || isLoadingProviders}>
                  {isSaving && <Loader2 className="size-4 animate-spin" />}
                  {t(isEdit ? "models.credentials.form.update" : "models.credentials.form.add")}
                </Button>
              </DialogFooter>
            </form>
          </MountedFormProvider>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
