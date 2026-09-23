"use client";

import { useModelCostMap } from "@/app/(dashboard)/hooks/models/useModelCostMap";
import { useModelFilterFacets, useModelsInfo } from "@/app/(dashboard)/hooks/models/useModels";
import { useTeams } from "@/app/(dashboard)/hooks/teams/useTeams";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { transformModelData } from "@/app/(dashboard)/models-and-endpoints/utils/modelDataTransformer";
import ReuseCredentialsModal from "@/components/model_add/reuse_credentials";
import { ModelData } from "@/components/model_dashboard/types";
import {
  CredentialItem,
  credentialCreateCall,
  credentialGetCall,
  testConnectionRequest,
} from "@/components/networking";
import UpdateModelCredentialsModal from "@/components/update_model_credentials_modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/lib/toast";
import { copyToClipboard } from "@/utils/dataUtils";
import { canModifyModel } from "@/utils/modelPermissions";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, ChevronDown, Copy, KeyRound, Loader2, Pencil, RefreshCw, Save, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FocusModelEditor } from "./FocusModelEditor";

interface FocusModelDetailsPanelProps {
  modelId: string;
  onBack: () => void;
  onDelete: (modelId: string) => void;
}

export function FocusModelDetailsPanel({ modelId, onBack, onDelete }: FocusModelDetailsPanelProps) {
  const { t } = useTranslation("gateway");
  const { accessToken, userId, userRole, isViewOnly } = useAuthorized();
  const { data: teams } = useTeams();
  const { data: modelCostMap } = useModelCostMap();
  const { availableModelAccessGroups } = useModelFilterFacets();
  const queryClient = useQueryClient();
  const [isTesting, setIsTesting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isUpdateApiKeyOpen, setIsUpdateApiKeyOpen] = useState(false);
  const [isReuseCredentialsOpen, setIsReuseCredentialsOpen] = useState(false);
  const [existingCredential, setExistingCredential] = useState<CredentialItem | null>(null);
  const [isLoadingCredential, setIsLoadingCredential] = useState(false);
  const { data: rawModelData, isLoading, isError, refetch } = useModelsInfo(1, 50, undefined, modelId);

  const getProviderFromModel = useCallback(
    (model: string) => {
      if (modelCostMap && typeof modelCostMap === "object" && model in modelCostMap) {
        return modelCostMap[model].litellm_provider;
      }
      return "openai";
    },
    [modelCostMap],
  );
  const model = useMemo(
    () => transformModelData(rawModelData, getProviderFromModel).data[0] as ModelData | undefined,
    [getProviderFromModel, rawModelData],
  );
  const canEdit = Boolean(
    model &&
      canModifyModel({ userRole, userID: userId, isViewOnly }, teams ?? null, {
        teamId: model.model_info?.team_id,
        isDbModel: model.model_info?.db_model === true,
      }),
  );
  const isAdmin = userRole === "Admin" && !isViewOnly;
  const publicName = model?.model_name || model?.litellm_model_name || t("models.unknown");
  const teamAlias = teams?.find((team) => team.team_id === model?.model_info?.team_id)?.team_alias ?? null;

  const refreshModel = async () => {
    await queryClient.invalidateQueries({ queryKey: ["models", "list"] });
    await refetch();
  };
  const handleCopyModelId = async () => {
    if (!(await copyToClipboard(modelId))) return;
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2000);
  };
  const handleTestConnection = async () => {
    if (!accessToken || !model) return;
    setIsTesting(true);
    try {
      const response = await testConnectionRequest(
        accessToken,
        {
          custom_llm_provider: model.litellm_params?.custom_llm_provider,
          litellm_credential_name: model.litellm_params?.litellm_credential_name,
          model: model.litellm_model_name,
        },
        { id: modelId, mode: model.model_info?.mode },
        model.model_info?.mode ?? "chat",
      );
      if (response.status !== "success") {
        throw new Error(response?.result?.error || response?.message || t("models.unknown"));
      }
      toast.success(t("models.details.connectionSuccess"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.fromError(t("models.details.connectionError", { error: message.slice(0, 160) }));
    } finally {
      setIsTesting(false);
    }
  };
  const openReuseCredentials = async () => {
    if (!accessToken) return;
    setIsLoadingCredential(true);
    try {
      const response = await credentialGetCall(accessToken, null, modelId);
      setExistingCredential({
        credential_name: response.credential_name,
        credential_values: response.credential_values,
        credential_info: response.credential_info,
      });
      setIsReuseCredentialsOpen(true);
    } catch (error) {
      console.error("Failed to load model credentials:", error);
      toast.fromError(t("models.reuseCredentials.error"));
    } finally {
      setIsLoadingCredential(false);
    }
  };
  const handleReuseCredentials = async (values: Record<string, unknown>) => {
    if (!accessToken || !model) return;
    try {
      toast.info(t("models.reuseCredentials.saving"));
      await credentialCreateCall(accessToken, {
        credential_name: values.credential_name,
        model_id: modelId,
        credential_info: { custom_llm_provider: model.litellm_params?.custom_llm_provider },
      });
      toast.success(t("models.reuseCredentials.success"));
      setIsReuseCredentialsOpen(false);
      await refreshModel();
    } catch (error) {
      console.error("Failed to store model credentials:", error);
      toast.fromError(t("models.reuseCredentials.error"));
    }
  };

  if (isLoading) {
    return (
      <section className="flex min-w-0 items-center justify-center p-6 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        {t("models.details.loading")}
      </section>
    );
  }

  if (isError || !model) {
    return (
      <section className="min-w-0 p-4 sm:p-5">
        <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
          <ArrowLeft className="size-4" />
          {t("focusModelsAndEndpoints.list.back")}
        </Button>
        <p className="mt-6 text-sm text-muted-foreground">{t("models.details.notFound")}</p>
      </section>
    );
  }

  return (
    <section className="min-w-0 p-4 sm:p-6" aria-label={publicName}>
      <Button variant="ghost" size="sm" className="-ml-2 gap-2" onClick={onBack}>
        <ArrowLeft className="size-4" />
        {t("focusModelsAndEndpoints.list.back")}
      </Button>

      <div className="mt-5 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("models.details.publicName")}
        </p>
        <h2 className="mt-1 break-words text-xl font-bold tracking-tight text-foreground">{publicName}</h2>
        <div className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <span>{t("models.details.modelId")}:</span>
          <code className="min-w-0 truncate">{modelId}</code>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => void handleCopyModelId()}
            aria-label={isCopied ? t("models.details.copied") : t("models.details.copyModelId")}
          >
            {isCopied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex flex-wrap items-center gap-2">
        <Button className="gap-2" onClick={() => setIsEditing(true)} disabled={!canEdit || isEditing}>
          <Pencil className="size-4" />
          {t("models.details.editModel")}
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => void handleTestConnection()} disabled={isTesting}>
          {isTesting ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          {isTesting ? t("models.details.testingConnection") : t("models.details.testConnection")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="gap-2" disabled={!canEdit && !isAdmin} />
            }
          >
            <KeyRound className="size-4" />
            {t("models.details.credentials")}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-64">
            <DropdownMenuItem disabled={!canEdit} onClick={() => setIsUpdateApiKeyOpen(true)}>
              <KeyRound className="size-4" />
              {t("models.details.updateApiKey")}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!isAdmin || isLoadingCredential} onClick={() => void openReuseCredentials()}>
              {isLoadingCredential ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {t("models.details.reuseCredentials")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isEditing && accessToken && (
        <div className="mt-6 rounded-xl border border-border bg-muted/25 p-4">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t("models.details.editModel")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("models.details.editDescription")}</p>
            </div>
          </div>
          <FocusModelEditor
            model={model}
            modelId={modelId}
            accessToken={accessToken}
            modelAccessGroups={availableModelAccessGroups}
            teamAlias={teamAlias}
            onCancel={() => setIsEditing(false)}
            onSaved={refreshModel}
          />
        </div>
      )}

      <div className="mt-8 border-t border-destructive/20 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
          {t("models.details.dangerZone")}
        </p>
        <Button
          variant="destructive"
          className="mt-3 w-full justify-start gap-2"
          onClick={() => onDelete(modelId)}
          disabled={!canEdit}
        >
          <Trash2 className="size-4" />
          {t("models.details.deleteModel")}
        </Button>
      </div>

      {accessToken && (
        <UpdateModelCredentialsModal
          open={isUpdateApiKeyOpen}
          onCancel={() => setIsUpdateApiKeyOpen(false)}
          accessToken={accessToken}
          modelId={modelId}
          onUpdated={() => void refreshModel()}
        />
      )}
      <ReuseCredentialsModal
        isVisible={isReuseCredentialsOpen}
        onCancel={() => setIsReuseCredentialsOpen(false)}
        onAddCredential={(values) => void handleReuseCredentials(values)}
        existingCredential={existingCredential}
        setIsCredentialModalOpen={setIsReuseCredentialsOpen}
      />
    </section>
  );
}
