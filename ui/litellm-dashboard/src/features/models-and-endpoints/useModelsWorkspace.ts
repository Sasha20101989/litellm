"use client";

import { useModelCostMap } from "@/app/(dashboard)/hooks/models/useModelCostMap";
import { useModelsInfo } from "@/app/(dashboard)/hooks/models/useModels";
import { useTeams } from "@/app/(dashboard)/hooks/teams/useTeams";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import {
  useModelDetailRouting,
  useModelGroupFilterRouting,
} from "@/app/(dashboard)/models-and-endpoints/detailNavigation";
import { transformModelData } from "@/app/(dashboard)/models-and-endpoints/utils/modelDataTransformer";
import { ModelData } from "@/components/model_dashboard/types";
import { modelDeleteCall, modelPatchUpdateCall } from "@/components/networking";
import { toast } from "@/lib/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@tanstack/react-pacer/debouncer";
import { ColumnFiltersState, functionalUpdate, OnChangeFn, PaginationState, SortingState } from "@tanstack/react-table";
import { createParser, parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useCallback, useMemo, useState } from "react";

import {
  ACCESS_GROUPS_COLUMN_ID,
  isModelTableSortColumnId,
  MODEL_NAME_COLUMN_ID,
  MODEL_TABLE_SORT_COLUMN_IDS,
  toServerSortField,
} from "@/app/(dashboard)/models-and-endpoints/components/ModelsTableColumns";
import {
  ALL_MODEL_GROUPS_VALUE,
  ModelViewMode,
  PERSONAL_TEAM_VALUE,
  WILDCARD_MODEL_GROUP_VALUE,
} from "@/app/(dashboard)/models-and-endpoints/components/AllModelsTable";

const SEARCH_DEBOUNCE_WAIT_MS = 200;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const MAX_PAGE = 100_000;
const MODEL_VIEW_MODES = ["current_team", "all"] as const satisfies readonly ModelViewMode[];

const boundedInteger = (min: number, max: number, fallback: number) =>
  createParser({
    parse: (value: string) => {
      const parsed = parseAsInteger.parse(value);
      return parsed === null ? null : Math.min(Math.max(parsed, min), max);
    },
    serialize: String,
  }).withDefault(fallback);

const TABLE_STATE = {
  model_search: parseAsString.withDefault(""),
  view_mode: parseAsStringLiteral(MODEL_VIEW_MODES).withDefault("current_team"),
  filter_team: parseAsString.withDefault(PERSONAL_TEAM_VALUE),
  access_group: parseAsString.withDefault(""),
  sort_by: parseAsStringLiteral(MODEL_TABLE_SORT_COLUMN_IDS),
  sort_order: parseAsStringLiteral(["asc", "desc"] as const).withDefault("asc"),
  page: boundedInteger(1, MAX_PAGE, 1),
  page_size: boundedInteger(1, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE),
};

interface UseModelsWorkspaceOptions {
  selectedModelGroup?: string | null;
  setSelectedModelGroup?: (modelGroup: string) => void;
  availableModelGroups?: string[];
  availableModelAccessGroups?: string[];
  onModelSelect?: (modelId: string) => void;
  onTeamSelect?: (teamId: string) => void;
}

export function useModelsWorkspace(options: UseModelsWorkspaceOptions = {}) {
  const { accessToken, userId, userRole, isViewOnly } = useAuthorized();
  const { data: teams, isLoading: isLoadingTeams } = useTeams();
  const { data: modelCostMap, isLoading: isLoadingModelCostMap } = useModelCostMap();
  const queryClient = useQueryClient();
  const { modelGroup: routedModelGroup, setModelGroup: setRoutedModelGroup } = useModelGroupFilterRouting();
  const { modelId: selectedModelId, openModel, openTeam, close } = useModelDetailRouting();
  const [tableState, setTableState] = useQueryStates(TABLE_STATE);
  const [debouncedSearch] = useDebouncedValue(tableState.model_search, { wait: SEARCH_DEBOUNCE_WAIT_MS });
  const [isModelSettingsModalVisible, setIsModelSettingsModalVisible] = useState(false);
  const [deleteModalModelId, setDeleteModalModelId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pausingModelId, setPausingModelId] = useState<string | null>(null);

  const selectedModelGroup = options.selectedModelGroup ?? routedModelGroup ?? ALL_MODEL_GROUPS_VALUE;
  const availableModelGroups = options.availableModelGroups ?? [];
  const availableModelAccessGroups = options.availableModelAccessGroups ?? [];
  const setSelectedModelGroup = useCallback(
    (modelGroup: string) => {
      if (options.setSelectedModelGroup) {
        options.setSelectedModelGroup(modelGroup);
        return;
      }
      setRoutedModelGroup(modelGroup === ALL_MODEL_GROUPS_VALUE ? null : modelGroup);
    },
    [options, setRoutedModelGroup],
  );
  const selectModel = useCallback(
    (modelId: string) => {
      if (options.onModelSelect) {
        options.onModelSelect(modelId);
        return;
      }
      openModel(modelId);
    },
    [openModel, options],
  );
  const selectTeam = useCallback(
    (teamId: string) => {
      if (options.onTeamSelect) {
        options.onTeamSelect(teamId);
        return;
      }
      openTeam(teamId);
    },
    [openTeam, options],
  );

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: tableState.page - 1, pageSize: tableState.page_size }),
    [tableState.page, tableState.page_size],
  );
  const sorting = useMemo<SortingState>(
    () => (tableState.sort_by ? [{ id: tableState.sort_by, desc: tableState.sort_order === "desc" }] : []),
    [tableState.sort_by, tableState.sort_order],
  );
  const selectedModelAccessGroupFilter = tableState.access_group || null;
  const teamIdForQuery = tableState.filter_team === PERSONAL_TEAM_VALUE ? undefined : tableState.filter_team;
  const isConcreteModelGroup =
    selectedModelGroup !== ALL_MODEL_GROUPS_VALUE && selectedModelGroup !== WILDCARD_MODEL_GROUP_VALUE;
  const modelNameForQuery = isConcreteModelGroup ? selectedModelGroup : undefined;
  const accessGroupForQuery =
    selectedModelAccessGroupFilter && selectedModelAccessGroupFilter !== ALL_MODEL_GROUPS_VALUE
      ? selectedModelAccessGroupFilter
      : undefined;
  const wildcardOnlyForQuery = selectedModelGroup === WILDCARD_MODEL_GROUP_VALUE;
  const sortBy = useMemo(
    () => (sorting.length === 0 ? undefined : toServerSortField(sorting[0].id)),
    [sorting],
  );
  const sortOrder = useMemo(() => {
    const activeSort = sorting[0];
    if (!activeSort) return undefined;
    return activeSort.desc ? "desc" : "asc";
  }, [sorting]);
  const { data: rawModelData, isLoading: isLoadingModels, isFetching, isError, refetch } = useModelsInfo(
    pagination.pageIndex + 1,
    pagination.pageSize,
    debouncedSearch || undefined,
    undefined,
    teamIdForQuery,
    sortBy,
    sortOrder,
    true,
    modelNameForQuery,
    accessGroupForQuery,
    wildcardOnlyForQuery,
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
  const modelData = useMemo<ModelData[]>(
    () => transformModelData(rawModelData, getProviderFromModel).data as ModelData[],
    [getProviderFromModel, rawModelData],
  );
  const columnFilters = useMemo<ColumnFiltersState>(
    () =>
      [
        selectedModelGroup !== ALL_MODEL_GROUPS_VALUE ? { id: MODEL_NAME_COLUMN_ID, value: selectedModelGroup } : null,
        selectedModelAccessGroupFilter ? { id: ACCESS_GROUPS_COLUMN_ID, value: selectedModelAccessGroupFilter } : null,
      ].filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    [selectedModelAccessGroupFilter, selectedModelGroup],
  );
  const teamOptions = useMemo(
    () => [
      { value: PERSONAL_TEAM_VALUE, label: "Personal" },
      ...(teams ?? [])
        .filter((team) => Boolean(team.team_id))
        .map((team) => ({ value: team.team_id, label: team.team_alias || team.team_id })),
    ],
    [teams],
  );
  const selectedTeam = useMemo(
    () => (teams ?? []).find((team) => team.team_id === tableState.filter_team) ?? null,
    [tableState.filter_team, teams],
  );
  const modelToDelete = useMemo(
    () => modelData.find((model) => model.model_info?.id === deleteModalModelId) ?? null,
    [deleteModalModelId, modelData],
  );

  const resetPage = useCallback(
    (state: Parameters<typeof setTableState>[0]) => {
      void setTableState({ ...state, page: null });
    },
    [setTableState],
  );
  const handleSearchChange = useCallback((value: string) => resetPage({ model_search: value || null }), [resetPage]);
  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      const next = functionalUpdate(updater, columnFilters);
      const modelGroup = next.find((entry) => entry.id === MODEL_NAME_COLUMN_ID)?.value;
      const accessGroup = next.find((entry) => entry.id === ACCESS_GROUPS_COLUMN_ID)?.value;
      setSelectedModelGroup(typeof modelGroup === "string" ? modelGroup : ALL_MODEL_GROUPS_VALUE);
      resetPage({ access_group: typeof accessGroup === "string" ? accessGroup : null });
    },
    [columnFilters, resetPage, setSelectedModelGroup],
  );
  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const active = functionalUpdate(updater, sorting)[0];
      resetPage({
        sort_by: active && isModelTableSortColumnId(active.id) ? active.id : null,
        sort_order: active?.desc ? "desc" : null,
      });
    },
    [resetPage, sorting],
  );
  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next = functionalUpdate(updater, pagination);
      void setTableState({ page: next.pageIndex + 1, page_size: next.pageSize });
    },
    [pagination, setTableState],
  );
  const setTeam = useCallback((teamId: string) => resetPage({ filter_team: teamId }), [resetPage]);
  const setViewMode = useCallback((viewMode: ModelViewMode) => void setTableState({ view_mode: viewMode }), [setTableState]);
  const setModelGroup = useCallback(
    (modelGroup: string) => {
      setSelectedModelGroup(modelGroup);
      resetPage({});
    },
    [resetPage, setSelectedModelGroup],
  );
  const setAccessGroup = useCallback((accessGroup: string) => resetPage({ access_group: accessGroup }), [resetPage]);
  const resetFilters = useCallback(() => {
    setSelectedModelGroup(ALL_MODEL_GROUPS_VALUE);
    void setTableState(null);
  }, [setSelectedModelGroup, setTableState]);
  const invalidateModels = useCallback(() => queryClient.invalidateQueries({ queryKey: ["models", "list"] }), [queryClient]);
  const refresh = useCallback(() => void refetch(), [refetch]);
  const togglePause = useCallback(
    async (modelId: string, blocked: boolean) => {
      if (!accessToken) return;
      try {
        setPausingModelId(modelId);
        await modelPatchUpdateCall(accessToken, { blocked }, modelId);
        toast.success(blocked ? "Model paused" : "Model resumed");
        await invalidateModels();
      } catch (error) {
        console.error("Error toggling model pause state:", error);
        toast.fromError(error);
      } finally {
        setPausingModelId(null);
      }
    },
    [accessToken, invalidateModels],
  );
  const deleteModel = useCallback(async () => {
    if (!accessToken || !deleteModalModelId) return;
    try {
      setDeleteLoading(true);
      await modelDeleteCall(accessToken, deleteModalModelId);
      toast.success("Model deleted successfully");
      await invalidateModels();
      const refreshed = await refetch();
      const totalPages = Math.max(
        1,
        refreshed.data?.total_pages ?? Math.ceil((refreshed.data?.total_count ?? 0) / pagination.pageSize),
      );
      void setTableState({ page: Math.min(pagination.pageIndex + 1, totalPages) });
      if (selectedModelId === deleteModalModelId) {
        close();
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.fromError(error);
    } finally {
      setDeleteLoading(false);
      setDeleteModalModelId(null);
    }
  }, [accessToken, close, deleteModalModelId, invalidateModels, pagination.pageIndex, pagination.pageSize, refetch, selectedModelId, setTableState]);
  const getModelPermissions = useCallback(
    (model: ModelData) => {
      if (isViewOnly || !model.model_info?.db_model) {
        return { canEdit: false, canTogglePause: false };
      }
      const isAdmin = userRole === "Admin";
      return {
        canEdit: isAdmin || model.model_info.created_by === userId,
        canTogglePause: isAdmin,
      };
    },
    [isViewOnly, userId, userRole],
  );

  return {
    data: modelData,
    rowCount: rawModelData?.total_count ?? 0,
    isLoading: isLoadingModels || isLoadingModelCostMap,
    isFetching,
    isError,
    pagination,
    sorting,
    columnFilters,
    search: tableState.model_search,
    selectedTeamValue: tableState.filter_team,
    selectedTeam,
    viewMode: tableState.view_mode,
    selectedModelGroup,
    selectedAccessGroup: selectedModelAccessGroupFilter ?? ALL_MODEL_GROUPS_VALUE,
    selectedModelId,
    availableModelGroups,
    availableModelAccessGroups,
    teamOptions,
    isLoadingTeams,
    userId,
    userRole,
    isViewOnly,
    modelToDelete,
    deleteModalModelId,
    deleteLoading,
    pausingModelId,
    isModelSettingsModalVisible,
    setIsModelSettingsModalVisible,
    setDeleteModalModelId,
    setSearch: handleSearchChange,
    setTeam,
    setViewMode,
    setModelGroup,
    setAccessGroup,
    setSelectedModelId: selectModel,
    setSelectedTeamId: selectTeam,
    closeSelection: close,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    resetFilters,
    refresh,
    togglePause,
    deleteModel,
    invalidateModels,
    getModelPermissions,
  };
}
