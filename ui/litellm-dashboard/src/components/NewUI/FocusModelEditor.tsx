"use client";

import { useModelHub } from "@/app/(dashboard)/hooks/models/useModels";
import { usePtuCostAttributionEnabled } from "@/app/(dashboard)/hooks/uiSettings/usePtuCostAttributionEnabled";
import ModelInfoEditForm, { type ModelEditFormValues, type TouchedPricingField } from "@/components/ModelInfoEditForm";
import {
  type CredentialItem,
  credentialListCall,
  getGuardrailsList,
  modelPatchUpdateCall,
  tagListCall,
} from "@/components/networking";
import type { ModelData } from "@/components/model_dashboard/types";
import type { Tag } from "@/components/tag_management/types";
import { toast } from "@/lib/toast";
import { applyPtuModelInfo } from "@/utils/ptuModelInfo";
import { stripMaskedSecrets } from "@/utils/maskedSecretUtils";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface FocusModelEditorProps {
  model: ModelData;
  modelId: string;
  accessToken: string;
  modelAccessGroups: string[];
  teamAlias: string | null;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}

export function FocusModelEditor({
  model,
  modelId,
  accessToken,
  modelAccessGroups,
  teamAlias,
  onCancel,
  onSaved,
}: FocusModelEditorProps) {
  const { t } = useTranslation("gateway");
  const { data: modelHubData } = useModelHub();
  const ptuCostAttributionEnabled = usePtuCostAttributionEnabled();
  const [isSaving, setIsSaving] = useState(false);
  const [showCacheControl, setShowCacheControl] = useState(
    Boolean(model.litellm_params?.cache_control_injection_points),
  );
  const [guardrails, setGuardrails] = useState<string[]>([]);
  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      const [guardrailsResult, tagsResult, credentialsResult] = await Promise.allSettled([
        getGuardrailsList(accessToken),
        tagListCall(accessToken),
        credentialListCall(accessToken),
      ]);
      if (guardrailsResult.status === "fulfilled") {
        setGuardrails(
          guardrailsResult.value.guardrails.map((guardrail: { guardrail_name: string }) => guardrail.guardrail_name),
        );
      }
      if (tagsResult.status === "fulfilled") setTags(tagsResult.value);
      if (credentialsResult.status === "fulfilled") setCredentials(credentialsResult.value.credentials ?? []);
    };
    void loadOptions();
  }, [accessToken]);

  const isWildcardModel = model.litellm_model_name.includes("*");
  const wildcardProvider = model.litellm_model_name.split("/")[0];
  const healthCheckModelOptions = useMemo(
    () =>
      modelHubData?.data
        ?.filter(
          (candidate: { providers?: string[]; model_group: string }) =>
            candidate.providers?.includes(wildcardProvider) && candidate.model_group !== model.litellm_model_name,
        )
        .map((candidate: { model_group: string }) => ({ value: candidate.model_group, label: candidate.model_group })) ?? [],
    [model.litellm_model_name, modelHubData?.data, wildcardProvider],
  );

  const handleSubmit = async (
    values: ModelEditFormValues,
    isFieldTouched: (field: TouchedPricingField) => boolean,
  ) => {
    setIsSaving(true);
    try {
      const parsedExtraParams = values.litellm_extra_params ? JSON.parse(values.litellm_extra_params) : {};
      delete parsedExtraParams.litellm_credential_name;
      const litellmParams: Record<string, unknown> = {
        ...parsedExtraParams,
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

      const setCost = (field: TouchedPricingField, param: string) => {
        if (!isFieldTouched(field)) return;
        const value = values[field];
        litellmParams[param] = value !== undefined && value !== null && value !== "" ? Number(value) / 1_000_000 : null;
      };
      setCost("input_cost", "input_cost_per_token");
      setCost("output_cost", "output_cost_per_token");
      setCost("cache_read_cost", "cache_read_input_token_cost");
      setCost("cache_write_cost", "cache_creation_input_token_cost");
      if (!isFieldTouched("cache_read_cost") && isFieldTouched("input_cost") && litellmParams.input_cost_per_token != null) {
        litellmParams.cache_read_input_token_cost = litellmParams.input_cost_per_token;
      }

      if (values.litellm_credential_name) litellmParams.litellm_credential_name = values.litellm_credential_name;
      if (values.guardrails) litellmParams.guardrails = values.guardrails;
      if (values.vector_store_ids !== undefined) litellmParams.vector_store_ids = values.vector_store_ids;
      if (values.cache_control && values.cache_control_injection_points?.length) {
        litellmParams.cache_control_injection_points = values.cache_control_injection_points;
      } else if (model.litellm_params?.cache_control_injection_points) {
        litellmParams.cache_control_injection_points = null;
      }

      let modelInfo = values.model_info ? JSON.parse(values.model_info) : model.model_info;
      if (values.model_access_group) modelInfo = { ...modelInfo, access_groups: values.model_access_group };
      if (values.health_check_model !== undefined) {
        modelInfo = { ...modelInfo, health_check_model: values.health_check_model };
      }
      modelInfo = applyPtuModelInfo(modelInfo, values, ptuCostAttributionEnabled);

      await modelPatchUpdateCall(
        accessToken,
        {
          model_name: values.model_name,
          litellm_params: stripMaskedSecrets(litellmParams),
          model_info: modelInfo,
        },
        modelId,
      );
      toast.success(t("models.details.updateSuccess"));
      await onSaved();
      onCancel();
    } catch (error) {
      console.error("Failed to update model:", error);
      toast.fromError(t("models.details.updateError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModelInfoEditForm
      localModelData={model}
      modelData={{ ...model, model_info: { ...model.model_info } }}
      teamAlias={teamAlias}
      accessToken={accessToken}
      isEditing
      isSaving={isSaving}
      isWildcardModel={isWildcardModel}
      ptuCostAttributionEnabled={ptuCostAttributionEnabled}
      showCacheControl={showCacheControl}
      setShowCacheControl={setShowCacheControl}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      modelAccessGroups={modelAccessGroups}
      guardrailsList={guardrails}
      tagsList={tags}
      credentialsList={credentials}
      healthCheckModelOptions={healthCheckModelOptions}
    />
  );
}
