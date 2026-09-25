export const MODEL_FIELD_IDS = [
  "modelId",
  "modelName",
  "credentials",
  "createdBy",
  "updatedAt",
  "costs",
  "team",
  "accessGroups",
  "source",
] as const;

export type ModelFieldId = (typeof MODEL_FIELD_IDS)[number];

export interface ModelFieldDefinition {
  id: ModelFieldId;
  focusTranslationKey: string;
  defaultFocusVisible: boolean;
  showInFocusCard: boolean;
  table: {
    columnId: string;
    translationKey: string;
    sortable: boolean;
    defaultVisible: boolean;
  };
}

export const MODEL_FIELDS: readonly ModelFieldDefinition[] = [
  {
    id: "modelId",
    focusTranslationKey: "focusModelsAndEndpoints.list.fields.modelId",
    defaultFocusVisible: false,
    showInFocusCard: false,
    table: { columnId: "model_info_id", translationKey: "models.columns.modelId", sortable: false, defaultVisible: true },
  },
  {
    id: "modelName",
    focusTranslationKey: "models.columns.information",
    defaultFocusVisible: false,
    showInFocusCard: false,
    table: { columnId: "model_name", translationKey: "models.columns.information", sortable: true, defaultVisible: true },
  },
  {
    id: "credentials",
    focusTranslationKey: "focusModelsAndEndpoints.list.fields.credentials",
    defaultFocusVisible: true,
    showInFocusCard: true,
    table: { columnId: "litellm_credential_name", translationKey: "models.columns.credentials", sortable: false, defaultVisible: true },
  },
  {
    id: "createdBy",
    focusTranslationKey: "focusModelsAndEndpoints.list.fields.createdBy",
    defaultFocusVisible: true,
    showInFocusCard: true,
    table: { columnId: "model_info_created_by", translationKey: "models.columns.createdBy", sortable: true, defaultVisible: true },
  },
  {
    id: "updatedAt",
    focusTranslationKey: "focusModelsAndEndpoints.list.fields.updatedAt",
    defaultFocusVisible: true,
    showInFocusCard: true,
    table: { columnId: "model_info_updated_at", translationKey: "models.columns.updatedAt", sortable: true, defaultVisible: true },
  },
  {
    id: "costs",
    focusTranslationKey: "focusModelsAndEndpoints.list.costs",
    defaultFocusVisible: true,
    showInFocusCard: true,
    table: { columnId: "input_cost", translationKey: "models.columns.costs", sortable: true, defaultVisible: true },
  },
  {
    id: "team",
    focusTranslationKey: "focusModelsAndEndpoints.list.team",
    defaultFocusVisible: true,
    showInFocusCard: true,
    table: { columnId: "model_info_team_id", translationKey: "models.columns.teamId", sortable: false, defaultVisible: true },
  },
  {
    id: "accessGroups",
    focusTranslationKey: "focusModelsAndEndpoints.list.fields.accessGroups",
    defaultFocusVisible: true,
    showInFocusCard: true,
    table: { columnId: "model_info_access_groups", translationKey: "models.columns.accessGroup", sortable: false, defaultVisible: true },
  },
  {
    id: "source",
    focusTranslationKey: "focusModelsAndEndpoints.list.source",
    defaultFocusVisible: true,
    showInFocusCard: true,
    table: { columnId: "model_info_db_model", translationKey: "models.columns.source", sortable: true, defaultVisible: false },
  },
];

export const getModelField = (id: ModelFieldId): ModelFieldDefinition => {
  const field = MODEL_FIELDS.find((candidate) => candidate.id === id);
  if (!field) throw new Error(`Unknown model field: ${id}`);
  return field;
};

export const MODEL_TABLE_FIELD_IDS = MODEL_FIELDS.map((field) => field.id);

export const FOCUS_MODEL_CARD_FIELD_IDS = MODEL_FIELDS.filter((field) => field.showInFocusCard).map((field) => field.id) as readonly Exclude<
  ModelFieldId,
  "modelId" | "modelName"
>[];

export const DEFAULT_FOCUS_MODEL_FIELD_VISIBILITY = Object.fromEntries(
  MODEL_FIELDS.map((field) => [field.id, field.defaultFocusVisible]),
) as Record<ModelFieldId, boolean>;

export const MODEL_TABLE_DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = Object.fromEntries(
  MODEL_FIELDS.map((field) => [field.table.columnId, field.table.defaultVisible]),
);
