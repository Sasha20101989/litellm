"use client";

import { useModelHub } from "@/app/(dashboard)/hooks/models/useModels";
import { usePtuCostAttributionEnabled } from "@/app/(dashboard)/hooks/uiSettings/usePtuCostAttributionEnabled";
import { useCredentialsWorkspace } from "@/features/models-and-endpoints/useCredentialsWorkspace";
import { buildModelUpdatePayload, type ModelFormValues, type TouchedPricingField } from "@/features/models-and-endpoints/modelFormContract";
import { FocusModelEditForm } from "./FocusModelEditForm";
import {
  getGuardrailsList,
  modelPatchUpdateCall,
  tagListCall,
} from "@/components/networking";
import type { ModelData } from "@/components/model_dashboard/types";
import type { Tag } from "@/components/tag_management/types";
import { toast } from "@/lib/toast";
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
  const { credentials } = useCredentialsWorkspace();

  useEffect(() => {
    const loadOptions = async () => {
      const [guardrailsResult, tagsResult] = await Promise.allSettled([
        getGuardrailsList(accessToken),
        tagListCall(accessToken),
      ]);
      if (guardrailsResult.status === "fulfilled") {
        setGuardrails(
          guardrailsResult.value.guardrails.map((guardrail: { guardrail_name: string }) => guardrail.guardrail_name),
        );
      }
      if (tagsResult.status === "fulfilled") setTags(tagsResult.value);
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
        .map((candidate: { model_group: string }) => ({
          value: candidate.model_group,
          label: candidate.model_group,
        })) ?? [],
    [model.litellm_model_name, modelHubData?.data, wildcardProvider],
  );

  const handleSubmit = async (values: ModelFormValues, isFieldTouched: (field: TouchedPricingField) => boolean) => {
    setIsSaving(true);
    try {
      const update = buildModelUpdatePayload({ model, values, isFieldTouched, ptuCostAttributionEnabled });
      await modelPatchUpdateCall(accessToken, update.patch, modelId);
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
    <FocusModelEditForm
      model={model}
      teamAlias={teamAlias}
      accessToken={accessToken}
      isSaving={isSaving}
      isWildcardModel={isWildcardModel}
      isPtuEnabled={ptuCostAttributionEnabled}
      showCacheControl={showCacheControl}
      setShowCacheControl={setShowCacheControl}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      modelAccessGroups={modelAccessGroups}
      guardrails={guardrails}
      tags={tags}
      credentials={credentials}
      healthCheckModelOptions={healthCheckModelOptions}
    />
  );
}
