"use client";

import { useModelCostMap } from "@/app/(dashboard)/hooks/models/useModelCostMap";
import { useModelFilterFacets, useModelsInfo } from "@/app/(dashboard)/hooks/models/useModels";
import { useTeams } from "@/app/(dashboard)/hooks/teams/useTeams";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { transformModelData } from "@/app/(dashboard)/models-and-endpoints/utils/modelDataTransformer";
import DeleteResourceModal from "@/components/common_components/DeleteResourceModal";
import { modelDeleteCall, modelPatchUpdateCall } from "@/components/networking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelData } from "@/components/model_dashboard/types";
import ModelSettingsModal from "@/components/model_dashboard/ModelSettingsModal/ModelSettingsModal";
import { usePersistedColumnVisibility } from "@/components/shared/DataTable";
import { cn } from "@/lib/cva.config";
import { toast } from "@/lib/toast";
import { uiHref } from "@/utils/uiHref";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@tanstack/react-pacer/debouncer";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Filter,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FocusModelDetailsPanel } from "./FocusModelDetailsPanel";
import { FocusModelCard, FocusModelFieldsVisibility, type FocusModelField } from "./FocusModelCard";

const PERSONAL_TEAM_VALUE = "personal";
const ALL_MODEL_GROUPS_VALUE = "all";
const WILDCARD_MODEL_GROUP_VALUE = "wildcard";
const SEARCH_DEBOUNCE_WAIT_MS = 200;
const DEFAULT_PAGE_SIZE = 50;
const PAGE_SIZES = [10, 25, 50] as const;
const MODEL_SORT_FIELDS = [
  "model_name",
  "model_info_created_by",
  "model_info_updated_at",
  "input_cost",
  "model_info_db_model",
] as const;
const DEFAULT_FIELD_VISIBILITY: Record<FocusModelField, boolean> = {
  team: true,
  source: true,
  costs: true,
  modelId: true,
  credentials: true,
  createdBy: true,
  updatedAt: true,
  accessGroups: true,
};

function toServerSortField(sortField: ModelSortField): string {
  switch (sortField) {
    case "model_info_created_by":
      return "created_at";
    case "model_info_updated_at":
      return "updated_at";
    case "input_cost":
      return "costs";
    case "model_info_db_model":
      return "status";
    default:
      return sortField;
  }
}

function getQueryFilters(selectedTeam: string, modelGroup: string, accessGroup: string) {
  const isWildcard = modelGroup === WILDCARD_MODEL_GROUP_VALUE;
  const isAllModels = modelGroup === ALL_MODEL_GROUPS_VALUE;
  return {
    teamId: selectedTeam === PERSONAL_TEAM_VALUE ? undefined : selectedTeam,
    modelName: isAllModels || isWildcard ? undefined : modelGroup,
    accessGroup: accessGroup === ALL_MODEL_GROUPS_VALUE ? undefined : accessGroup,
    wildcardOnly: isWildcard,
  };
}

function getListState(
  isLoading: boolean,
  isError: boolean,
  modelData: ModelData[],
): "loading" | "error" | "empty" | "ready" {
  if (isLoading) return "loading";
  if (isError) return "error";
  return modelData.length === 0 ? "empty" : "ready";
}

function getModelPermissions(model: ModelData, userRole: string, userId: string, isViewOnly: boolean) {
  if (isViewOnly || !model.model_info?.db_model) {
    return { canEdit: false, canTogglePause: false };
  }

  const isAdmin = userRole === "Admin";
  return {
    canEdit: isAdmin || model.model_info.created_by === userId,
    canTogglePause: isAdmin,
  };
}

function ModelsListResults({
  state,
  modelData,
  userRole,
  userId,
  isViewOnly,
  selectedModelId,
  pausingModelId,
  getTeamName,
  locale,
  visibleFields,
  onSelect,
  onPauseToggle,
  onDelete,
}: {
  state: "loading" | "error" | "empty" | "ready";
  modelData: ModelData[];
  userRole: string;
  userId: string;
  isViewOnly: boolean;
  selectedModelId: string | null;
  pausingModelId: string | null;
  getTeamName: (teamId: string | null | undefined) => string;
  locale: string;
  visibleFields: Record<FocusModelField, boolean>;
  onSelect: (modelId: string | null) => void;
  onPauseToggle: (model: ModelData) => void;
  onDelete: (modelId: string | null) => void;
}) {
  const { t } = useTranslation("gateway");

  if (state === "loading") {
    return (
      <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t("models.loading")}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-destructive">
        <CircleAlert className="size-4" />
        {t("focusModelsAndEndpoints.list.error")}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center gap-1 text-center">
        <Search className="size-5 text-muted-foreground" />
        <p className="font-medium text-foreground">{t("models.emptyTitle")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("models.emptyDescription")}</p>
      </div>
    );
  }

  return modelData.map((model) => {
    const permissions = getModelPermissions(model, userRole, userId, isViewOnly);
    return (
      <FocusModelCard
        key={model.model_info?.id || model.litellm_model_name}
        model={model}
        selected={selectedModelId === model.model_info?.id}
        teamName={getTeamName(model.model_info?.team_id)}
        locale={locale}
        visibleFields={visibleFields}
        canEdit={permissions.canEdit}
        canTogglePause={permissions.canTogglePause}
        isPausing={pausingModelId === model.model_info?.id}
        onSelect={() => onSelect(model.model_info?.id || null)}
        onPauseToggle={() => onPauseToggle(model)}
        onDelete={() => onDelete(model.model_info?.id || null)}
      />
    );
  });
}

function ModelsAccessHint({ selectedTeam, teamName }: { selectedTeam: string; teamName: string }) {
  const { t } = useTranslation("gateway");

  return (
    <div className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      {selectedTeam === PERSONAL_TEAM_VALUE ? (
        <span>
          {t("models.accessHintPersonal")}{" "}
          <Link href={uiHref("new-ui")} className="font-medium text-info hover:underline">
            {t("models.virtualKeysPage")}
          </Link>
          .
        </span>
      ) : (
        <span>
          {t("models.accessHintTeam", { team: teamName })}{" "}
          <Link href={uiHref("new-ui")} className="font-medium text-info hover:underline">
            {t("models.virtualKeysPage")}
          </Link>
          .
        </span>
      )}
    </div>
  );
}

export function FocusModelsList() {
  const { t, i18n } = useTranslation("gateway");
  const { accessToken, userId, userRole, isViewOnly } = useAuthorized();
  const { data: teams, isLoading: isLoadingTeams } = useTeams();
  const { data: modelCostMap } = useModelCostMap();
  const { availableModelGroupOptions, availableModelAccessGroups } = useModelFilterFacets();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, { wait: SEARCH_DEBOUNCE_WAIT_MS });
  const [selectedTeam, setSelectedTeam] = useState(PERSONAL_TEAM_VALUE);
  const [modelGroup, setModelGroup] = useState(ALL_MODEL_GROUPS_VALUE);
  const [accessGroup, setAccessGroup] = useState(ALL_MODEL_GROUPS_VALUE);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<ModelSortField | "none">("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedModelId, setSelectedModelId] = useQueryState("model", parseAsString.withOptions({ history: "push" }));
  const [deleteModelId, setDeleteModelId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pausingModelId, setPausingModelId] = useState<string | null>(null);
  const [isModelSettingsModalVisible, setIsModelSettingsModalVisible] = useState(false);
  const { columnVisibility, onColumnVisibilityChange } = usePersistedColumnVisibility(
    "focus-models-and-endpoints",
    DEFAULT_FIELD_VISIBILITY,
  );
  const visibleFields = useMemo(
    () => ({ ...DEFAULT_FIELD_VISIBILITY, ...columnVisibility }) as Record<FocusModelField, boolean>,
    [columnVisibility],
  );

  const queryFilters = getQueryFilters(selectedTeam, modelGroup, accessGroup);
  const {
    data: rawModelData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useModelsInfo(
    page,
    pageSize,
    debouncedSearch || undefined,
    undefined,
    queryFilters.teamId,
    sortBy === "none" ? undefined : toServerSortField(sortBy),
    sortBy === "none" ? undefined : sortOrder,
    true,
    queryFilters.modelName,
    queryFilters.accessGroup,
    queryFilters.wildcardOnly,
  );

  const getProviderFromModel = useCallback(
    (model: string) => {
      if (modelCostMap && typeof modelCostMap === "object" && model in modelCostMap) {
        return modelCostMap[model].litellm_provider;
      }
      return "openai";
    },
    [modelCostMap],
  );
  const modelData = useMemo(
    () => transformModelData(rawModelData, getProviderFromModel).data as ModelData[],
    [getProviderFromModel, rawModelData],
  );
  const teamOptions = useMemo(
    () => [
      { value: PERSONAL_TEAM_VALUE, label: t("focusModelsAndEndpoints.list.personal") },
      ...(teams ?? [])
        .filter((team) => Boolean(team.team_id))
        .map((team) => ({ value: team.team_id, label: team.team_alias || team.team_id })),
    ],
    [t, teams],
  );
  const modelToDelete = useMemo(
    () => modelData.find((model) => model.model_info?.id === deleteModelId) ?? null,
    [deleteModelId, modelData],
  );
  const totalPages = Math.max(1, rawModelData?.total_pages ?? Math.ceil((rawModelData?.total_count ?? 0) / pageSize));
  const listState = getListState(isLoading, isError, modelData);
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const selectedTeamLabel = teamOptions.find((team) => team.value === selectedTeam)?.label ?? "";
  const modelGroupSentinelLabels: Record<string, string> = {
    [ALL_MODEL_GROUPS_VALUE]: t("focusModelsAndEndpoints.list.allModels"),
    [WILDCARD_MODEL_GROUP_VALUE]: t("focusModelsAndEndpoints.list.wildcardModels"),
  };
  const selectedModelGroupLabel =
    modelGroupSentinelLabels[modelGroup] ??
    availableModelGroupOptions.find((group) => group.value === modelGroup)?.label ??
    t("models.unknown");
  const selectedAccessGroupLabel =
    accessGroup === ALL_MODEL_GROUPS_VALUE ? t("focusModelsAndEndpoints.list.allAccessGroups") : accessGroup;
  const sortLabels: Record<ModelSortField | "none", string> = {
    none: t("focusModelsAndEndpoints.list.sort.none"),
    model_name: t("focusModelsAndEndpoints.list.sort.name"),
    model_info_created_by: t("focusModelsAndEndpoints.list.sort.createdBy"),
    model_info_updated_at: t("focusModelsAndEndpoints.list.sort.updatedAt"),
    input_cost: t("focusModelsAndEndpoints.list.sort.costs"),
    model_info_db_model: t("focusModelsAndEndpoints.list.sort.source"),
  };

  const resetPage = (update: () => void) => {
    update();
    setPage(1);
    void setSelectedModelId(null);
  };
  const teamName = (teamId: string | null | undefined) =>
    !teamId
      ? t("focusModelsAndEndpoints.list.personal")
      : teams?.find((team) => team.team_id === teamId)?.team_alias || teamId;
  const handleRefresh = () => void refetch();
  const handleTogglePause = async (model: ModelData) => {
    const modelId = model.model_info?.id;
    if (!accessToken || !modelId) return;
    try {
      setPausingModelId(modelId);
      const blocked = model.model_info?.blocked !== true;
      await modelPatchUpdateCall(accessToken, { blocked }, modelId);
      toast.success(t(blocked ? "models.paused" : "models.resumed"));
      queryClient.invalidateQueries({ queryKey: ["models", "list"] });
    } catch (error) {
      console.error("Error toggling model pause state:", error);
      toast.fromError(error);
    } finally {
      setPausingModelId(null);
    }
  };
  const handleDelete = async () => {
    if (!accessToken || !deleteModelId) return;
    try {
      setDeleteLoading(true);
      await modelDeleteCall(accessToken, deleteModelId);
      toast.success(t("models.deleted"));
      queryClient.invalidateQueries({ queryKey: ["models", "list"] });
      const refreshed = await refetch();
      const totalPagesAfterDelete = Math.max(
        1,
        refreshed.data?.total_pages ?? Math.ceil((refreshed.data?.total_count ?? 0) / pageSize),
      );
      setPage((current) => Math.min(current, totalPagesAfterDelete));
      if (selectedModelId === deleteModelId) void setSelectedModelId(null);
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.fromError(error);
    } finally {
      setDeleteLoading(false);
      setDeleteModelId(null);
    }
  };

  return (
    <div
      className={`grid min-h-[640px] grid-cols-1 ${
        selectedModelId ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : "lg:grid-cols-1"
      }`}
    >
      <section
        className={`min-w-0 overflow-hidden ${selectedModelId ? "hidden border-r border-border lg:block" : "block"}`}
      >
        <div className="border-b border-border p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-foreground">{t("focusModelsAndEndpoints.innerTabs.allModels")}</h2>
              <p className="text-sm text-muted-foreground">{t("focusModelsAndEndpoints.list.description")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setIsModelSettingsModalVisible(true)}
                aria-label={t("models.settings")}
                title={t("models.settings")}
                data-testid="focus-models-settings-trigger"
              >
                <Settings className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleRefresh}
                disabled={isFetching}
                aria-label={t("focusModelsAndEndpoints.list.refresh")}
              >
                <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => resetPage(() => setSearch(event.target.value))}
                className="pl-8"
                placeholder={t("models.search")}
                aria-label={t("models.search")}
              />
            </div>
            <Select value={selectedTeam} onValueChange={(value) => resetPage(() => setSelectedTeam(String(value)))}>
              <SelectTrigger size="sm" aria-label={t("models.currentTeam")} className="w-full min-w-64 gap-2 sm:w-72">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    selectedTeam === PERSONAL_TEAM_VALUE ? "bg-info" : "bg-success",
                  )}
                />
                <span className="text-muted-foreground">{t("models.team")}</span>
                <span className="truncate font-semibold">{selectedTeamLabel}</span>
              </SelectTrigger>
              <SelectContent className="min-w-72">
                {teamOptions.map((team) => (
                  <SelectItem key={team.value} value={team.value} disabled={isLoadingTeams}>
                    {team.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
            <Select value={modelGroup} onValueChange={(value) => resetPage(() => setModelGroup(String(value)))}>
              <SelectTrigger
                size="sm"
                aria-label={t("models.filters.publicName")}
                className="w-full min-w-72 gap-2 sm:w-88"
              >
                <span className="text-muted-foreground">{t("models.filters.publicName")}</span>
                <span className="truncate">{selectedModelGroupLabel}</span>
              </SelectTrigger>
              <SelectContent className="min-w-88">
                <SelectItem value={ALL_MODEL_GROUPS_VALUE}>{t("focusModelsAndEndpoints.list.allModels")}</SelectItem>
                <SelectItem value={WILDCARD_MODEL_GROUP_VALUE}>
                  {t("focusModelsAndEndpoints.list.wildcardModels")}
                </SelectItem>
                {availableModelGroupOptions.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    <span className="truncate">{group.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={accessGroup} onValueChange={(value) => resetPage(() => setAccessGroup(String(value)))}>
              <SelectTrigger
                size="sm"
                aria-label={t("models.filters.accessGroup")}
                className="w-full min-w-72 gap-2 sm:w-88"
              >
                <span className="text-muted-foreground">{t("models.filters.accessGroup")}</span>
                <span className="truncate">{selectedAccessGroupLabel}</span>
              </SelectTrigger>
              <SelectContent className="min-w-88">
                <SelectItem value={ALL_MODEL_GROUPS_VALUE}>
                  {t("focusModelsAndEndpoints.list.allAccessGroups")}
                </SelectItem>
                {availableModelAccessGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => resetPage(() => setSortBy(value as ModelSortField | "none"))}
            >
              <SelectTrigger
                size="sm"
                aria-label={t("focusModelsAndEndpoints.list.sort.label")}
                className="w-full min-w-72 gap-2 sm:w-80"
              >
                <span className="text-muted-foreground">{t("focusModelsAndEndpoints.list.sort.label")}</span>
                <span className="truncate">{sortLabels[sortBy]}</span>
              </SelectTrigger>
              <SelectContent className="min-w-80">
                <SelectItem value="none">{t("focusModelsAndEndpoints.list.sort.none")}</SelectItem>
                <SelectItem value="model_name">{t("focusModelsAndEndpoints.list.sort.name")}</SelectItem>
                <SelectItem value="model_info_created_by">
                  {t("focusModelsAndEndpoints.list.sort.createdBy")}
                </SelectItem>
                <SelectItem value="model_info_updated_at">
                  {t("focusModelsAndEndpoints.list.sort.updatedAt")}
                </SelectItem>
                <SelectItem value="input_cost">{t("focusModelsAndEndpoints.list.sort.costs")}</SelectItem>
                <SelectItem value="model_info_db_model">{t("focusModelsAndEndpoints.list.sort.source")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={sortBy === "none"}
              onClick={() => resetPage(() => setSortOrder((current) => (current === "asc" ? "desc" : "asc")))}
            >
              {sortOrder === "asc"
                ? t("focusModelsAndEndpoints.list.sort.asc")
                : t("focusModelsAndEndpoints.list.sort.desc")}
            </Button>
            <FocusModelFieldsVisibility
              visibility={visibleFields}
              onChange={(next) => onColumnVisibilityChange(next)}
            />
          </div>
        </div>
        <div className="space-y-2 p-3 sm:p-4">
          <ModelsListResults
            state={listState}
            modelData={modelData}
            userRole={userRole}
            userId={userId}
            isViewOnly={isViewOnly}
            selectedModelId={selectedModelId}
            pausingModelId={pausingModelId}
            getTeamName={teamName}
            locale={locale}
            visibleFields={visibleFields}
            onSelect={(modelId) => void setSelectedModelId(modelId)}
            onPauseToggle={(model) => void handleTogglePause(model)}
            onDelete={setDeleteModelId}
          />
          <ModelsAccessHint
            selectedTeam={selectedTeam}
            teamName={teamName(selectedTeam === PERSONAL_TEAM_VALUE ? undefined : selectedTeam)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3 text-sm text-muted-foreground sm:p-4">
          <span>{t("focusModelsAndEndpoints.list.pagination.total", { count: rawModelData?.total_count ?? 0 })}</span>
          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => resetPage(() => setPageSize(Number(value) as (typeof PAGE_SIZES)[number]))}
            >
              <SelectTrigger size="sm" aria-label={t("focusModelsAndEndpoints.list.pagination.pageSize")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              aria-label={t("focusModelsAndEndpoints.list.pagination.previous")}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              aria-label={t("focusModelsAndEndpoints.list.pagination.next")}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
      {selectedModelId && (
        <FocusModelDetailsPanel
          modelId={selectedModelId}
          onBack={() => void setSelectedModelId(null)}
          onDelete={setDeleteModelId}
        />
      )}
      <ModelSettingsModal
        isVisible={isModelSettingsModalVisible}
        onCancel={() => setIsModelSettingsModalVisible(false)}
        onSuccess={() => setIsModelSettingsModalVisible(false)}
      />
      <DeleteResourceModal
        isOpen={Boolean(deleteModelId)}
        title={t("models.deleteModal.title")}
        alertMessage={t("models.deleteModal.warning")}
        message={t("models.deleteModal.confirmation")}
        resourceInformationTitle={t("models.deleteModal.information")}
        resourceInformation={
          modelToDelete
            ? [
                { label: t("models.deleteModal.modelName"), value: modelToDelete.model_name || "-" },
                { label: t("models.deleteModal.litellmName"), value: modelToDelete.litellm_model_name || "-" },
                { label: t("models.deleteModal.provider"), value: modelToDelete.provider || "-" },
                { label: t("models.deleteModal.createdBy"), value: modelToDelete.model_info?.created_by || "-" },
              ]
            : []
        }
        onCancel={() => setDeleteModelId(null)}
        onOk={handleDelete}
        confirmLoading={deleteLoading}
      />
    </div>
  );
}
