"use client";

import { useModelsWorkspace } from "@/features/models-and-endpoints/useModelsWorkspace";
import { useModelFilterFacets } from "@/app/(dashboard)/hooks/models/useModels";
import DeleteResourceModal from "@/components/common_components/DeleteResourceModal";
import ModelSettingsModal from "@/components/model_dashboard/ModelSettingsModal/ModelSettingsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePersistedColumnVisibility } from "@/components/shared/DataTable";
import { cn } from "@/lib/cva.config";
import { uiHref } from "@/utils/uiHref";
import { type PaginationState, type SortingState } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, CircleAlert, Filter, Info, Loader2, RefreshCw, Search, Settings } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { DEFAULT_FOCUS_MODEL_FIELD_VISIBILITY, type ModelFieldId } from "@/features/models-and-endpoints/modelFields";
import { FocusModelCard, FocusModelFieldsVisibility } from "./FocusModelCard";
import { FocusModelDetailsPanel } from "./FocusModelDetailsPanel";

function getFocusListLayout(selectedModelId: string | null) {
  if (selectedModelId) {
    return {
      grid: "lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]",
      list: "hidden border-r border-border lg:block",
    };
  }
  return { grid: "lg:grid-cols-1", list: "block" };
}

function applyFocusSort(value: string, sorting: SortingState, onChange: (next: SortingState) => void) {
  if (value === "none") {
    onChange([]);
    return;
  }
  onChange([{ id: value, desc: sorting[0]?.desc ?? false }]);
}

function ModelsListResults({
  workspace,
  locale,
}: {
  workspace: ReturnType<typeof useModelsWorkspace> & { visibleFields: Record<ModelFieldId, boolean> };
  locale: string;
}) {
  const { t } = useTranslation("gateway");

  if (workspace.isLoading) {
    return (
      <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t("models.loading")}
      </div>
    );
  }
  if (workspace.isError) {
    return (
      <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-destructive">
        <CircleAlert className="size-4" />
        {t("focusModelsAndEndpoints.list.error")}
      </div>
    );
  }
  if (workspace.data.length === 0) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center gap-1 text-center">
        <Search className="size-5 text-muted-foreground" />
        <p className="font-medium text-foreground">{t("models.emptyTitle")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("models.emptyDescription")}</p>
      </div>
    );
  }

  return workspace.data.map((model) => {
    const modelId = model.model_info?.id;
    const permissions = workspace.getModelPermissions(model);
    const teamId = model.model_info?.team_id;
    const teamName = !teamId
      ? t("focusModelsAndEndpoints.list.personal")
      : workspace.teamOptions.find((team) => team.value === teamId)?.label || teamId;
    return (
      <FocusModelCard
        key={modelId || model.litellm_model_name}
        model={model}
        selected={workspace.selectedModelId === modelId}
        teamName={teamName}
        locale={locale}
        visibleFields={workspace.visibleFields}
        canEdit={permissions.canEdit}
        canTogglePause={permissions.canTogglePause}
        isPausing={workspace.pausingModelId === modelId}
        onSelect={() => modelId && workspace.setSelectedModelId(modelId)}
        onPauseToggle={() => modelId && void workspace.togglePause(modelId, model.model_info?.blocked !== true)}
        onDelete={() => workspace.setDeleteModalModelId(modelId || null)}
      />
    );
  });
}

function ModelsAccessHint({ selectedTeam, teamName, visible }: { selectedTeam: string; teamName: string; visible: boolean }) {
  const { t } = useTranslation("gateway");
  if (!visible) return null;
  return (
    <div className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      {selectedTeam === "personal" ? (
        <span>
          {t("models.accessHintPersonal")} <Link href={uiHref("new-ui")} className="font-medium text-info hover:underline">{t("models.virtualKeysPage")}</Link>.
        </span>
      ) : (
        <span>
          {t("models.accessHintTeam", { team: teamName })} <Link href={uiHref("new-ui")} className="font-medium text-info hover:underline">{t("models.virtualKeysPage")}</Link>.
        </span>
      )}
    </div>
  );
}

export function FocusModelsList() {
  const { t, i18n } = useTranslation("gateway");
  const { availableModelGroups, availableModelAccessGroups } = useModelFilterFacets();
  const workspace = useModelsWorkspace({ availableModelGroups, availableModelAccessGroups });
  const { columnVisibility, onColumnVisibilityChange } = usePersistedColumnVisibility(
    "focus-models-and-endpoints",
    DEFAULT_FOCUS_MODEL_FIELD_VISIBILITY,
  );
  const visibleFields = useMemo(
    () => ({ ...DEFAULT_FOCUS_MODEL_FIELD_VISIBILITY, ...columnVisibility }) as Record<ModelFieldId, boolean>,
    [columnVisibility],
  );
  const workspaceWithFields = { ...workspace, visibleFields };
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const selectedTeamLabel = workspace.teamOptions.find((team) => team.value === workspace.selectedTeamValue)?.label ?? "";
  const selectedModelGroupLabel = useMemo(() => {
    if (workspace.selectedModelGroup === "all") return t("focusModelsAndEndpoints.list.allModels");
    if (workspace.selectedModelGroup === "wildcard") return t("focusModelsAndEndpoints.list.wildcardModels");
    return workspace.selectedModelGroup;
  }, [t, workspace.selectedModelGroup]);
  const selectedAccessGroupLabel =
    workspace.selectedAccessGroup === "all" ? t("focusModelsAndEndpoints.list.allAccessGroups") : workspace.selectedAccessGroup;
  const totalPages = Math.max(1, Math.ceil(workspace.rowCount / workspace.pagination.pageSize));
  const layout = getFocusListLayout(workspace.selectedModelId);
  const setPage = (pageIndex: number) =>
    workspace.onPaginationChange({ pageIndex, pageSize: workspace.pagination.pageSize } as PaginationState);

  return (
    <div className={`grid min-h-[640px] grid-cols-1 ${layout.grid}`}>
      <section className={`min-w-0 overflow-hidden ${layout.list}`}>
        <div className="border-b border-border p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-foreground">{t("focusModelsAndEndpoints.innerTabs.allModels")}</h2>
              <p className="text-sm text-muted-foreground">{t("focusModelsAndEndpoints.list.description")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" onClick={() => workspace.setIsModelSettingsModalVisible(true)} aria-label={t("models.settings")} title={t("models.settings")} data-testid="focus-models-settings-trigger"><Settings className="size-4" /></Button>
              <Button variant="outline" size="icon-sm" onClick={workspace.refresh} disabled={workspace.isFetching} aria-label={t("focusModelsAndEndpoints.list.refresh")}><RefreshCw className={`size-4 ${workspace.isFetching ? "animate-spin" : ""}`} /></Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="relative min-w-48 flex-1"><Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input value={workspace.search} onChange={(event) => workspace.setSearch(event.target.value)} className="pl-8" placeholder={t("models.search")} aria-label={t("models.search")} /></div>
            <Select value={workspace.selectedTeamValue} onValueChange={(value) => workspace.setTeam(String(value))}><SelectTrigger size="sm" aria-label={t("models.currentTeam")} className="w-full min-w-64 gap-2 sm:w-72"><span className={cn("size-2 shrink-0 rounded-full", workspace.selectedTeamValue === "personal" ? "bg-info" : "bg-success")} /><span className="text-muted-foreground">{t("models.team")}</span><span className="truncate font-semibold">{selectedTeamLabel}</span></SelectTrigger><SelectContent className="min-w-72">{workspace.teamOptions.map((team) => <SelectItem key={team.value} value={team.value} disabled={workspace.isLoadingTeams}>{team.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
            <Select value={workspace.selectedModelGroup} onValueChange={(value) => workspace.setModelGroup(String(value))}><SelectTrigger size="sm" aria-label={t("models.filters.publicName")} className="w-full min-w-72 gap-2 sm:w-88"><span className="text-muted-foreground">{t("models.filters.publicName")}</span><span className="truncate">{selectedModelGroupLabel}</span></SelectTrigger><SelectContent className="min-w-88"><SelectItem value="all">{t("focusModelsAndEndpoints.list.allModels")}</SelectItem><SelectItem value="wildcard">{t("focusModelsAndEndpoints.list.wildcardModels")}</SelectItem>{workspace.availableModelGroups.map((group) => <SelectItem key={group} value={group}><span className="truncate">{group}</span></SelectItem>)}</SelectContent></Select>
            <Select value={workspace.selectedAccessGroup} onValueChange={(value) => workspace.setAccessGroup(String(value))}><SelectTrigger size="sm" aria-label={t("models.filters.accessGroup")} className="w-full min-w-72 gap-2 sm:w-88"><span className="text-muted-foreground">{t("models.filters.accessGroup")}</span><span className="truncate">{selectedAccessGroupLabel}</span></SelectTrigger><SelectContent className="min-w-88"><SelectItem value="all">{t("focusModelsAndEndpoints.list.allAccessGroups")}</SelectItem>{workspace.availableModelAccessGroups.map((group) => <SelectItem key={group} value={group}>{group}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Select value={workspace.sorting[0]?.id ?? "none"} onValueChange={(value) => applyFocusSort(value ?? "none", workspace.sorting, workspace.onSortingChange)}><SelectTrigger size="sm" aria-label={t("focusModelsAndEndpoints.list.sort.label")} className="w-full min-w-72 gap-2 sm:w-80"><span className="text-muted-foreground">{t("focusModelsAndEndpoints.list.sort.label")}</span><SelectValue /></SelectTrigger><SelectContent className="min-w-80"><SelectItem value="none">{t("focusModelsAndEndpoints.list.sort.none")}</SelectItem><SelectItem value="model_name">{t("focusModelsAndEndpoints.list.sort.name")}</SelectItem><SelectItem value="model_info_created_by">{t("focusModelsAndEndpoints.list.sort.createdBy")}</SelectItem><SelectItem value="model_info_updated_at">{t("focusModelsAndEndpoints.list.sort.updatedAt")}</SelectItem><SelectItem value="input_cost">{t("focusModelsAndEndpoints.list.sort.costs")}</SelectItem><SelectItem value="model_info_db_model">{t("focusModelsAndEndpoints.list.sort.source")}</SelectItem></SelectContent></Select>
            <Button variant="outline" size="sm" disabled={workspace.sorting.length === 0} onClick={() => workspace.onSortingChange((current) => current.map((sort) => ({ ...sort, desc: !sort.desc })))}>{workspace.sorting[0]?.desc ? t("focusModelsAndEndpoints.list.sort.desc") : t("focusModelsAndEndpoints.list.sort.asc")}</Button>
            <FocusModelFieldsVisibility visibility={visibleFields} onChange={onColumnVisibilityChange} />
          </div>
        </div>
        <div className="space-y-2 p-3 sm:p-4"><ModelsListResults workspace={workspaceWithFields} locale={locale} /><ModelsAccessHint selectedTeam={workspace.selectedTeamValue} teamName={selectedTeamLabel} visible={workspace.viewMode === "current_team"} /></div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3 text-sm text-muted-foreground sm:p-4"><span>{t("focusModelsAndEndpoints.list.pagination.total", { count: workspace.rowCount })}</span><div className="flex items-center gap-2"><Select value={String(workspace.pagination.pageSize)} onValueChange={(value) => workspace.onPaginationChange({ pageIndex: 0, pageSize: Number(value) } as PaginationState)}><SelectTrigger size="sm" aria-label={t("focusModelsAndEndpoints.list.pagination.pageSize")}><SelectValue /></SelectTrigger><SelectContent>{[10, 25, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select><Button variant="outline" size="icon-sm" disabled={workspace.pagination.pageIndex <= 0} onClick={() => setPage(workspace.pagination.pageIndex - 1)} aria-label={t("focusModelsAndEndpoints.list.pagination.previous")}><ChevronLeft className="size-4" /></Button><span className="tabular-nums">{workspace.pagination.pageIndex + 1} / {totalPages}</span><Button variant="outline" size="icon-sm" disabled={workspace.pagination.pageIndex + 1 >= totalPages} onClick={() => setPage(workspace.pagination.pageIndex + 1)} aria-label={t("focusModelsAndEndpoints.list.pagination.next")}><ChevronRight className="size-4" /></Button></div></div>
      </section>
      {workspace.selectedModelId && <FocusModelDetailsPanel modelId={workspace.selectedModelId} onBack={workspace.closeSelection} onDelete={workspace.setDeleteModalModelId} />}
      <ModelSettingsModal isVisible={workspace.isModelSettingsModalVisible} onCancel={() => workspace.setIsModelSettingsModalVisible(false)} onSuccess={() => workspace.setIsModelSettingsModalVisible(false)} />
      <DeleteResourceModal isOpen={Boolean(workspace.deleteModalModelId)} title={t("models.deleteModal.title")} alertMessage={t("models.deleteModal.warning")} message={t("models.deleteModal.confirmation")} resourceInformationTitle={t("models.deleteModal.information")} resourceInformation={workspace.modelToDelete ? [{ label: t("models.deleteModal.modelName"), value: workspace.modelToDelete.model_name || "-" }, { label: t("models.deleteModal.litellmName"), value: workspace.modelToDelete.litellm_model_name || "-" }, { label: t("models.deleteModal.provider"), value: workspace.modelToDelete.provider || "-" }, { label: t("models.deleteModal.createdBy"), value: workspace.modelToDelete.model_info?.created_by || "-" }] : []} onCancel={() => workspace.setDeleteModalModelId(null)} onOk={workspace.deleteModel} confirmLoading={workspace.deleteLoading} />
    </div>
  );
}
