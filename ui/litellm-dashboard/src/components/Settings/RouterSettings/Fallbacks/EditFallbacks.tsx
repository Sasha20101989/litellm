/**
 * Modal for editing an existing fallback entry
 * Lets the user add/remove models from a primary model's fallback chain
 * Reuses FallbackGroupConfig with the primary model locked
 */

import { Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import React, { useMemo, useState } from "react";
import { fetchAvailableModels } from "@/components/llm_calls/fetch_models";
import NotificationManager from "../../../molecules/notifications_manager";
import { AddFallbacksModal } from "./AddFallbacksModal";
import { FallbackGroup, FallbackGroupConfig, FallbackLabels } from "./FallbackGroupConfig";
import { useTranslation } from "react-i18next";

export type FallbackEntry = { [modelName: string]: string[] };
export type Fallbacks = FallbackEntry[];

interface EditFallbacksProps {
  accessToken: string;
  fallbackEntry: FallbackEntry;
  value: Fallbacks;
  onChange: (fallbacks: Fallbacks) => Promise<void>;
  onClose: () => void;
  maxFallbacks?: number;
}

const toGroup = (entry: FallbackEntry): FallbackGroup => {
  const primaryModel = Object.keys(entry)[0] ?? null;
  return {
    id: "edit",
    primaryModel,
    fallbackModels: primaryModel ? [...(entry[primaryModel] ?? [])] : [],
  };
};

export default function EditFallbacks({
  accessToken,
  fallbackEntry,
  value,
  onChange,
  onClose,
  maxFallbacks = 10,
}: EditFallbacksProps) {
  const { t } = useTranslation("settings");
  const [group, setGroup] = useState<FallbackGroup>(() => toGroup(fallbackEntry));
  const [isSaving, setIsSaving] = useState(false);

  const { data: modelGroups = [] } = useQuery({
    queryKey: ["availableModels", "fallbacks"],
    queryFn: () => fetchAvailableModels(accessToken),
    enabled: Boolean(accessToken),
  });

  const availableModels = useMemo(
    () => Array.from(new Set(modelGroups.map((option) => option.model_group))).sort(),
    [modelGroups],
  );

  const handleSave = async () => {
    const primaryModel = group.primaryModel;
    if (!primaryModel) {
      return;
    }

    const updatedFallbacks = (value || []).map((entry) =>
      primaryModel in entry ? { ...entry, [primaryModel]: group.fallbackModels } : entry,
    );

    setIsSaving(true);
    try {
      await onChange(updatedFallbacks);
      NotificationManager.success(t("router.fallbacks.updated", { model: primaryModel }));
      onClose();
    } catch (error) {
      console.error("Error updating fallbacks:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const fallbackLabels: FallbackLabels = {
    group: t("router.fallbacks.group"),
    atLeastOne: t("router.fallbacks.atLeastOne"),
    empty: t("router.fallbacks.emptyGroups"),
    createFirst: t("router.fallbacks.createFirst"),
    primaryModel: t("router.fallbacks.primaryModel"),
    selectPrimary: t("router.fallbacks.selectPrimary"),
    selectPrimaryHint: t("router.fallbacks.selectPrimaryHint"),
    ifFails: t("router.fallbacks.ifFails"),
    fallbackChain: t("router.fallbacks.fallbackChain"),
    maxFallbacks: t("router.fallbacks.maxFallbacks"),
    selectFallbacks: t("router.fallbacks.selectFallbacks"),
    maxReached: t("router.fallbacks.maxReached"),
    more: t("router.fallbacks.more"),
    selectionHint: t("router.fallbacks.selectionHint"),
    maxReachedHint: t("router.fallbacks.maxReachedHint"),
    noFallbacks: t("router.fallbacks.noFallbacks"),
    addFromDropdown: t("router.fallbacks.addFromDropdown"),
    removeFallback: t("router.fallbacks.removeFallback"),
  };

  return (
    <AddFallbacksModal open onCancel={onClose}>
      <FallbackGroupConfig
        group={group}
        onChange={setGroup}
        availableModels={availableModels}
        maxFallbacks={maxFallbacks}
        disablePrimaryModel
        labels={fallbackLabels}
      />
      <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
        <Button type="default" onClick={onClose} disabled={isSaving}>
          {t("router.fallbacks.cancel")}
        </Button>
        <Button
          type="primary"
          icon={<Pencil className="w-4 h-4" />}
          onClick={handleSave}
          disabled={isSaving || group.fallbackModels.length === 0}
          loading={isSaving}
        >
          {isSaving ? t("router.fallbacks.savingChanges") : t("router.fallbacks.saveChanges")}
        </Button>
      </div>
    </AddFallbacksModal>
  );
}
