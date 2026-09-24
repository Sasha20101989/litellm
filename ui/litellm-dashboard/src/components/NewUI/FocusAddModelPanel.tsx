"use client";

import { useCredentials } from "@/app/(dashboard)/hooks/credentials/useCredentials";
import { useGuardrails } from "@/app/(dashboard)/hooks/guardrails/useGuardrails";
import { useModelCostMap } from "@/app/(dashboard)/hooks/models/useModelCostMap";
import { useModelFilterFacets } from "@/app/(dashboard)/hooks/models/useModels";
import { useProviderFields } from "@/app/(dashboard)/hooks/providers/useProviderFields";
import { useTags } from "@/app/(dashboard)/hooks/tags/useTags";
import { useTeams } from "@/app/(dashboard)/hooks/teams/useTeams";
import { usePtuCostAttributionEnabled } from "@/app/(dashboard)/hooks/uiSettings/usePtuCostAttributionEnabled";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import {
  MountedFormField,
  MountedFormProvider,
  projectMountedValues,
  useMountRegistry,
  type MountedFormValues,
} from "@/components/common_components/MountedFormField";
import TeamDropdown from "@/components/common_components/team_dropdown";
import { apiClient, testConnectionRequest } from "@/components/networking";
import { ProviderLogo } from "@/components/molecules/models/ProviderLogo";
import { getProviderModels, Providers } from "@/components/provider_info_helpers";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { SearchSelect, type SearchSelectOption } from "@/components/shared/SearchSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";
import { modelCreationScope } from "@/utils/modelPermissions";
import { isProxyAdminRole, isUserTeamAdminForSingleTeam } from "@/utils/roles";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleAlert, CircleX, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FocusAddModelAdvancedSettings } from "./FocusAddModelAdvancedSettings";
import { FocusProviderCredentialFields } from "./FocusProviderCredentialFields";
import {
  buildFocusModelCreatePayloads,
  type FocusModelCreateValues,
  type FocusModelMapping,
} from "./focusModelCreatePayload";

const INITIAL_VALUES: MountedFormValues = {
  custom_llm_provider: Providers.Anthropic,
  mode: "chat",
  model: [],
  model_mappings: [],
  litellm_credential_name: "",
};

const MODEL_MODES = [
  ["chat", "/chat/completions"],
  ["completion", "/completions"],
  ["embedding", "/embeddings"],
  ["audio_speech", "/audio/speech"],
  ["audio_transcription", "/audio/transcriptions"],
  ["image_generation", "/images/generations"],
  ["image_edit", "/images/edits"],
  ["video_generation", "/videos"],
  ["rerank", "/rerank"],
  ["realtime", "/realtime"],
  ["batch", "/batch"],
  ["ocr", "/ocr"],
] as const;

interface OperationResult {
  status: "success" | "error";
  message: string;
}

function required(message: string) {
  return (value: unknown): string | true => {
    if (Array.isArray(value)) return value.length > 0 ? true : message;
    return value != null && String(value).trim() !== "" ? true : message;
  };
}

function CreationResult({ result }: { result: OperationResult | null }) {
  if (!result) return null;
  const isSuccess = result.status === "success";
  const Icon = isSuccess ? CheckCircle2 : CircleX;
  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
        isSuccess
          ? "border-success/30 bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{result.message}</span>
    </div>
  );
}

function ModelMappingsEditor({
  mappings,
  onChange,
}: {
  mappings: FocusModelMapping[];
  onChange: (value: FocusModelMapping[]) => void;
}) {
  const { t } = useTranslation("gateway");
  return (
    <div className="space-y-2">
      {mappings.map((mapping, index) => (
        <div
          key={`${mapping.litellm_model}-${index}`}
          className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <label className="space-y-1 text-sm font-medium">
            {t("models.create.publicName")}
            <Input
              value={mapping.public_name}
              onChange={(event) =>
                onChange(
                  mappings.map((item, position) =>
                    position === index ? { ...item, public_name: event.target.value } : item,
                  ),
                )
              }
            />
          </label>
          <label className="space-y-1 text-sm font-medium">
            {t("models.create.providerModel")}
            <Input value={mapping.litellm_model} disabled />
          </label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive"
            aria-label={t("models.create.removeModel", { name: mapping.public_name })}
            onClick={() => onChange(mappings.filter((_, position) => position !== index))}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function FocusAddModelPanel() {
  const { t } = useTranslation("gateway");
  const { accessToken, userId, userRole, isViewOnly } = useAuthorized();
  const { data: teams } = useTeams();
  const { data: credentialsData } = useCredentials();
  const { data: providerMetadata, isLoading: isLoadingProviders } = useProviderFields();
  const { data: modelCostMap } = useModelCostMap();
  const { data: guardrailsData } = useGuardrails();
  const { data: tagsData } = useTags();
  const { availableModelAccessGroups } = useModelFilterFacets();
  const isPtuEnabled = usePtuCostAttributionEnabled();
  const queryClient = useQueryClient();
  const form = useForm<MountedFormValues>({ mode: "onChange", defaultValues: INITIAL_VALUES });
  const registry = useMountRegistry();
  const selectedProvider = useWatch({ control: form.control, name: "custom_llm_provider" }) as string | undefined;
  const selectedModels = useWatch({ control: form.control, name: "model" });
  const selectedCredential = useWatch({ control: form.control, name: "litellm_credential_name" });
  const mappings =
    (useWatch({ control: form.control, name: "model_mappings" }) as FocusModelMapping[] | undefined) ?? [];
  const [isTeamOnly, setIsTeamOnly] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);

  const scope = modelCreationScope(
    { userRole, userID: userId, isViewOnly },
    { teams: teams ?? null, disabledForInternalUsers: false },
  );
  const isAdmin = userRole != null && isProxyAdminRole(userRole);
  const providerOptions: SearchSelectOption[] = useMemo(
    () =>
      [...(providerMetadata ?? [])]
        .sort((left, right) => left.provider_display_name.localeCompare(right.provider_display_name))
        .map((provider) => ({
          label: provider.provider_display_name,
          value: provider.provider,
          icon: <ProviderLogo provider={provider.provider} className="size-5" />,
        })),
    [providerMetadata],
  );
  const selectedProviderMetadata = providerMetadata?.find((provider) => provider.provider === selectedProvider);
  const providerModels = useMemo(
    () => (selectedProvider ? getProviderModels(selectedProvider, modelCostMap) : []),
    [modelCostMap, selectedProvider],
  );
  const modeItems = useMemo(
    () =>
      MODEL_MODES.map(([value, endpoint]) => ({
        value,
        label: `${t(`models.create.modes.${value}`)}, ${endpoint}`,
      })),
    [t],
  );
  const modelOptions = useMemo(
    () => [
      { value: "custom", label: t("models.create.customModel") },
      { value: "all-wildcard", label: t("models.create.wildcardModels") },
      ...providerModels.map((model) => ({ value: model, label: model })),
    ],
    [providerModels, t],
  );
  const credentialOptions = useMemo(
    () => [
      { value: "", label: t("models.editor.none") },
      ...(credentialsData?.credentials ?? []).map((credential) => ({
        value: credential.credential_name,
        label: credential.credential_name,
      })),
    ],
    [credentialsData?.credentials, t],
  );

  useEffect(() => {
    const values = Array.isArray(selectedModels)
      ? selectedModels.filter((value): value is string => typeof value === "string")
      : [];
    if (values.includes("all-wildcard")) {
      form.setValue("model_mappings", []);
      return;
    }
    const current = form.getValues("model_mappings") as FocusModelMapping[] | undefined;
    const next = values.map((model) => {
      const internalName = model === "custom" ? String(form.getValues("custom_model_name") ?? "custom") : model;
      const litellmModel = selectedProvider === Providers.Azure ? `azure/${internalName}` : internalName;
      return (
        current?.find((mapping) => mapping.litellm_model === litellmModel) ?? {
          public_name: internalName,
          litellm_model: litellmModel,
        }
      );
    });
    form.setValue("model_mappings", next);
  }, [form, selectedModels, selectedProvider]);

  const handleProviderChange = (onChange: (...event: unknown[]) => void, value: string | null) => {
    onChange(value);
    form.setValue("model", []);
    form.setValue("model_mappings", []);
  };
  const handleCustomModelNameChange = (value: string) => {
    form.setValue("custom_model_name", value);
    const litellmModel = selectedProvider === Providers.Azure ? `azure/${value}` : value;
    form.setValue(
      "model_mappings",
      mappings.map((mapping) =>
        mapping.litellm_model === "custom" || mapping.litellm_model === "azure/custom"
          ? { public_name: value, litellm_model: litellmModel }
          : mapping,
      ),
    );
  };
  const mountedValues = () => projectMountedValues(registry, form.getValues) as FocusModelCreateValues;
  const teamFilter = (team: NonNullable<typeof teams>[number]) =>
    scope !== "team-required" || isUserTeamAdminForSingleTeam(team.members_with_roles, userId);

  const preparePayloads = async () => {
    const isValid = await form.trigger(registry.mountedNames() as string[]);
    if (!isValid) return null;
    const messages = {
      jsonStringExpected: (fieldName: string) => t("models.create.validation.jsonString", { fieldName }),
      jsonObjectExpected: (fieldName: string) => t("models.create.validation.jsonObject", { fieldName }),
      providerRequired: t("models.create.validation.provider"),
      modelRequired: t("models.create.validation.model"),
      modelNamesRequired: t("models.create.validation.modelNames"),
      extraParamsField: t("models.editor.fields.extraParams"),
      modelInfoField: t("models.editor.fields.modelInfo"),
    };
    return buildFocusModelCreatePayloads(mountedValues(), messages);
  };

  const handleTest = async () => {
    setResult(null);
    setIsTesting(true);
    try {
      const payloads = await preparePayloads();
      if (!payloads?.length) return;
      const first = payloads[0];
      const response = await testConnectionRequest(
        accessToken,
        first.litellm_params as Record<string, unknown>,
        first.model_info as Record<string, unknown>,
        String((first.model_info as Record<string, unknown>).mode ?? "chat"),
      );
      if (response.status !== "success") {
        throw new Error(response.result?.error || response.message || t("models.create.unknownError"));
      }
      setResult({ status: "success", message: t("models.create.connectionSuccess") });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResult({ status: "error", message: t("models.create.connectionError", { error: message.slice(0, 220) }) });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async () => {
    setResult(null);
    setIsSubmitting(true);
    try {
      const payloads = await preparePayloads();
      if (!payloads?.length) return;
      for (const payload of payloads) {
        await apiClient.post("/model/new", { accessToken, body: payload });
      }
      await queryClient.invalidateQueries({ queryKey: ["models", "list"] });
      form.reset(INITIAL_VALUES);
      setIsTeamOnly(false);
      setIsAdvancedOpen(false);
      const message = t("models.create.success", { count: payloads.length });
      setResult({ status: "success", message });
      toast.success(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const localized = t("models.create.error", { error: message.slice(0, 220) });
      setResult({ status: "error", message: localized });
      toast.fromError(localized);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (scope === "forbidden") {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-border bg-muted/20 p-6 text-center">
        <div>
          <CircleAlert className="mx-auto size-6 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">{t("models.create.forbiddenTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("models.create.forbiddenDescription")}</p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <MountedFormProvider value={{ control: form.control, registry }}>
        <form
          className="mx-auto max-w-5xl space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div>
            <h2 className="text-xl font-bold tracking-tight">{t("models.create.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("models.create.description")}</p>
          </div>

          <section className="space-y-4 rounded-lg border border-border bg-background p-4 sm:p-5">
            <div>
              <h3 className="text-sm font-semibold">{t("models.create.sections.model")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("models.create.sections.modelDescription")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {scope === "team-required" && (
                <MountedFormField
                  name="team_id"
                  label={t("models.create.team")}
                  required
                  rules={{ validate: { required: required(t("models.create.validation.team")) } }}
                >
                  {(control) => (
                    <TeamDropdown
                      id={control.id}
                      value={control.value as string | undefined}
                      onChange={control.onChange}
                      filterTeam={teamFilter}
                    />
                  )}
                </MountedFormField>
              )}
              <MountedFormField
                name="custom_llm_provider"
                label={t("models.create.provider")}
                required
                rules={{ validate: { required: required(t("models.create.validation.provider")) } }}
              >
                {(control) => (
                  <SearchSelect
                    inputId={control.id}
                    options={providerOptions}
                    value={(control.value as string | undefined) ?? null}
                    onValueChange={(value) => handleProviderChange(control.onChange, value)}
                    placeholder={
                      isLoadingProviders ? t("models.create.loadingProviders") : t("models.create.selectProvider")
                    }
                    emptyText={t("models.create.noProviders")}
                  />
                )}
              </MountedFormField>
              <MountedFormField
                name="model"
                label={t("models.create.models")}
                required
                rules={{ validate: { required: required(t("models.create.validation.model")) } }}
              >
                {(control) =>
                  providerModels.length > 0 ? (
                    <MultiSelect
                      id={control.id}
                      value={(control.value as string[] | undefined) ?? []}
                      onValueChange={control.onChange}
                      options={modelOptions}
                      placeholder={t("models.create.selectModels")}
                      emptyText={t("models.create.noModels")}
                    />
                  ) : (
                    <Input
                      id={control.id}
                      value={Array.isArray(control.value) ? String(control.value[0] ?? "") : ""}
                      onChange={(event) => {
                        control.onChange(event.target.value ? [event.target.value] : []);
                      }}
                      onBlur={control.onBlur}
                      placeholder={selectedProviderMetadata?.default_model_placeholder ?? t("models.create.enterModel")}
                    />
                  )
                }
              </MountedFormField>
              <MountedFormField name="mode" label={t("models.create.mode")} defaultValue="chat">
                {(control) => (
                  <Select
                    items={modeItems}
                    value={(control.value as string | undefined) ?? "chat"}
                    onValueChange={control.onChange}
                  >
                    <SelectTrigger id={control.id} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </MountedFormField>
            </div>
            {Array.isArray(selectedModels) && selectedModels.includes("custom") && (
              <MountedFormField
                name="custom_model_name"
                label={t("models.create.customModelName")}
                required
                rules={{ validate: { required: required(t("models.create.validation.customModel")) } }}
              >
                {(control) => (
                  <Input
                    id={control.id}
                    value={(control.value as string | undefined) ?? ""}
                    onChange={(event) => handleCustomModelNameChange(event.target.value)}
                    onBlur={control.onBlur}
                    placeholder={t("models.create.enterCustomModel")}
                  />
                )}
              </MountedFormField>
            )}
            {mappings.length > 0 && (
              <MountedFormField name="model_mappings" label={t("models.create.mappings")} bare>
                {(control) => (
                  <ModelMappingsEditor
                    mappings={(control.value as FocusModelMapping[] | undefined) ?? []}
                    onChange={control.onChange}
                  />
                )}
              </MountedFormField>
            )}
          </section>

          <section className="space-y-4 rounded-lg border border-border bg-background p-4 sm:p-5">
            <div>
              <h3 className="text-sm font-semibold">{t("models.create.sections.credentials")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("models.create.sections.credentialsDescription")}</p>
            </div>
            <MountedFormField
              name="litellm_credential_name"
              label={t("models.editor.fields.credentials")}
              defaultValue=""
            >
              {(control) => (
                <SearchSelect
                  inputId={control.id}
                  options={credentialOptions}
                  value={(control.value as string | undefined) ?? ""}
                  onValueChange={(value) => control.onChange(value ?? "")}
                  placeholder={t("models.editor.placeholders.credentials")}
                  emptyText={t("models.editor.noMatchingOptions")}
                />
              )}
            </MountedFormField>
            {!selectedCredential && (
              <FocusProviderCredentialFields
                fields={selectedProviderMetadata?.credential_fields ?? []}
                provider={selectedProvider}
              />
            )}
          </section>

          {isAdmin && (
            <section className="space-y-4 rounded-lg border border-border bg-background p-4 sm:p-5">
              <div>
                <h3 className="text-sm font-semibold">{t("models.create.sections.access")}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t("models.create.sections.accessDescription")}</p>
              </div>
              <label className="flex items-center justify-between gap-4 text-sm font-medium">
                {t("models.create.teamOnly")}
                <Switch
                  checked={isTeamOnly}
                  onCheckedChange={(checked) => {
                    setIsTeamOnly(checked);
                    if (!checked) form.setValue("team_id", undefined);
                  }}
                />
              </label>
              {isTeamOnly && (
                <MountedFormField
                  name="team_id"
                  label={t("models.create.team")}
                  required
                  rules={{ validate: { required: required(t("models.create.validation.team")) } }}
                >
                  {(control) => (
                    <TeamDropdown
                      id={control.id}
                      value={control.value as string | undefined}
                      onChange={control.onChange}
                    />
                  )}
                </MountedFormField>
              )}
              <MountedFormField name="model_access_group" label={t("models.editor.fields.accessGroups")}>
                {(control) => (
                  <MultiSelect
                    id={control.id}
                    value={(control.value as string[] | undefined) ?? []}
                    onValueChange={control.onChange}
                    options={availableModelAccessGroups.map((group) => ({ value: group, label: group }))}
                    placeholder={t("models.editor.placeholders.accessGroups")}
                    emptyText={t("models.editor.noMatchingOptions")}
                    allowCustomValues
                  />
                )}
              </MountedFormField>
            </section>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsAdvancedOpen((open) => !open)}
          >
            {t("models.create.advancedSettings")}
            <Plus className={`size-4 transition-transform ${isAdvancedOpen ? "rotate-45" : ""}`} />
          </Button>
          {isAdvancedOpen && (
            <FocusAddModelAdvancedSettings
              accessToken={accessToken}
              isPtuEnabled={isPtuEnabled}
              guardrails={guardrailsData?.guardrails.map((guardrail) => guardrail.guardrail_name) ?? []}
              tags={tagsData ?? {}}
            />
          )}

          <CreationResult result={result} />
          <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background/95 py-4 backdrop-blur">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleTest()}
              disabled={isTesting || isSubmitting}
            >
              {isTesting && <Loader2 className="size-4 animate-spin" />}
              {isTesting ? t("models.create.testing") : t("models.create.testConnection")}
            </Button>
            <Button type="submit" disabled={isSubmitting || isTesting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? t("models.create.creating") : t("models.create.submit")}
            </Button>
          </div>
        </form>
      </MountedFormProvider>
    </FormProvider>
  );
}
