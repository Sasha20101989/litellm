import { getModelField, MODEL_TABLE_FIELD_IDS } from "./modelFields";

export type ModelViewMode = "all" | "current_team";

export const MODEL_VIEW_MODES = ["current_team", "all"] as const satisfies readonly ModelViewMode[];
export const PERSONAL_TEAM_VALUE = "personal";
export const ALL_MODEL_GROUPS_VALUE = "all";
export const WILDCARD_MODEL_GROUP_VALUE = "wildcard";

export const MODEL_ID_COLUMN_ID = getModelField("modelId").table.columnId;
export const MODEL_NAME_COLUMN_ID = getModelField("modelName").table.columnId;
export const CREDENTIALS_COLUMN_ID = getModelField("credentials").table.columnId;
export const CREATED_BY_COLUMN_ID = getModelField("createdBy").table.columnId;
export const UPDATED_AT_COLUMN_ID = getModelField("updatedAt").table.columnId;
export const COSTS_COLUMN_ID = getModelField("costs").table.columnId;
export const TEAM_ID_COLUMN_ID = getModelField("team").table.columnId;
export const ACCESS_GROUPS_COLUMN_ID = getModelField("accessGroups").table.columnId;
export const STATUS_COLUMN_ID = getModelField("source").table.columnId;

export const MODEL_TABLE_SORT_COLUMN_IDS = MODEL_TABLE_FIELD_IDS.filter((field) => getModelField(field).table.sortable).map(
  (field) => getModelField(field).table.columnId,
);

export type ModelTableSortColumnId = string;

export const isModelTableSortColumnId = (columnId: string): columnId is ModelTableSortColumnId =>
  MODEL_TABLE_SORT_COLUMN_IDS.includes(columnId);

const COLUMN_ID_TO_SERVER_SORT_FIELD: Record<string, string> = {
  [COSTS_COLUMN_ID]: "costs",
  [STATUS_COLUMN_ID]: "status",
  [CREATED_BY_COLUMN_ID]: "created_at",
  [UPDATED_AT_COLUMN_ID]: "updated_at",
};

export const toServerSortField = (columnId: string): string => COLUMN_ID_TO_SERVER_SORT_FIELD[columnId] ?? columnId;

export interface ModelCapabilities {
  canModify: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canTogglePause: boolean;
}
