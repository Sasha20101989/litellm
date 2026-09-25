"use client";

import { useModelsWorkspace } from "@/features/models-and-endpoints/useModelsWorkspace";
import DeleteResourceModal from "@/components/common_components/DeleteResourceModal";
import ModelSettingsModal from "@/components/model_dashboard/ModelSettingsModal/ModelSettingsModal";
import { uiHref } from "@/utils/uiHref";
import { Info } from "lucide-react";

import { AllModelsTable } from "./AllModelsTable";

interface AllModelsTabProps {
  selectedModelGroup?: string | null;
  setSelectedModelGroup?: (selectedModelGroup: string) => void;
  availableModelGroups?: string[];
  availableModelGroupOptions?: Array<{ value: string; label: string }>;
  availableModelAccessGroups?: string[];
  setSelectedModelId?: (id: string) => void;
  setSelectedTeamId?: (id: string) => void;
}

const AllModelsTab = ({
  selectedModelGroup,
      setSelectedModelGroup,
  availableModelGroups,
  availableModelGroupOptions,
  availableModelAccessGroups,
  setSelectedModelId,
  setSelectedTeamId,
}: AllModelsTabProps) => {
  const workspaceOptions = {
    selectedModelGroup,
    setSelectedModelGroup,
    availableModelGroups,
    availableModelGroupOptions,
    availableModelAccessGroups,
    onModelSelect: setSelectedModelId,
    onTeamSelect: setSelectedTeamId,
  };
  const workspace = useModelsWorkspace(workspaceOptions);
  const teamAccessLabel = workspace.selectedTeam?.team_alias || workspace.selectedTeam?.team_id || "";

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        <AllModelsTable
          data={workspace.data}
          rowCount={workspace.rowCount}
          isLoading={workspace.isLoading}
          isRefreshing={workspace.isFetching}
          onRefresh={workspace.refresh}
          sorting={workspace.sorting}
          onSortingChange={workspace.onSortingChange}
          pagination={workspace.pagination}
          onPaginationChange={workspace.onPaginationChange}
          columnFilters={workspace.columnFilters}
          onColumnFiltersChange={workspace.onColumnFiltersChange}
          onResetFilters={workspace.resetFilters}
          searchValue={workspace.search}
          onSearchChange={workspace.setSearch}
          teamOptions={workspace.teamOptions}
          selectedTeamValue={workspace.selectedTeamValue}
          onTeamChange={workspace.setTeam}
          isLoadingTeams={workspace.isLoadingTeams}
          viewMode={workspace.viewMode}
          onViewModeChange={workspace.setViewMode}
          onOpenModelSettings={() => workspace.setIsModelSettingsModalVisible(true)}
          availableModelGroups={workspace.availableModelGroups}
          availableModelGroupOptions={workspace.availableModelGroupOptions}
          availableModelAccessGroups={workspace.availableModelAccessGroups}
          userRole={workspace.userRole}
          userID={workspace.userId}
          isViewOnly={workspace.isViewOnly}
          onModelIdClick={workspace.setSelectedModelId}
          onTeamIdClick={workspace.setSelectedTeamId}
          onDeleteClick={workspace.setDeleteModalModelId}
          onTogglePauseClick={workspace.togglePause}
          pausingModelId={workspace.pausingModelId}
          getModelCapabilities={workspace.getModelCapabilities}
        />

        {workspace.viewMode === "current_team" && (
          <div className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {workspace.selectedTeamValue === "personal" ? (
              <span>
                To access these models, create a Virtual Key without selecting a team on the{" "}
                <a href={uiHref("api-keys")} className="font-medium text-info hover:underline">
                  Virtual Keys page
                </a>
                .
              </span>
            ) : (
              <span>
                To access these models, create a Virtual Key and select Team as &quot;{teamAccessLabel}&quot; on the{" "}
                <a href={uiHref("api-keys")} className="font-medium text-info hover:underline">
                  Virtual Keys page
                </a>
                .
              </span>
            )}
          </div>
        )}
      </div>

      <DeleteResourceModal
        isOpen={Boolean(workspace.deleteModalModelId)}
        title="Delete Model"
        alertMessage="This action cannot be undone."
        message="Are you sure you want to delete this model?"
        resourceInformationTitle="Model Information"
        resourceInformation={
          workspace.modelToDelete
            ? [
                { label: "Model Name", value: workspace.modelToDelete.model_name || "Not Set" },
                { label: "Nexoplane Model Name", value: workspace.modelToDelete.litellm_model_name || "Not Set" },
                { label: "Provider", value: workspace.modelToDelete.provider || "Not Set" },
                { label: "Created By", value: workspace.modelToDelete.model_info?.created_by || "Not Set" },
              ]
            : []
        }
        onCancel={() => workspace.setDeleteModalModelId(null)}
        onOk={workspace.deleteModel}
        confirmLoading={workspace.deleteLoading}
      />
      <ModelSettingsModal
        isVisible={workspace.isModelSettingsModalVisible}
        onCancel={() => workspace.setIsModelSettingsModalVisible(false)}
        onSuccess={() => workspace.setIsModelSettingsModalVisible(false)}
      />
    </div>
  );
};

export default AllModelsTab;
