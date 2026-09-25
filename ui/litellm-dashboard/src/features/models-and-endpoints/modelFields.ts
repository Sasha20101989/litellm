export const MODEL_FIELD_IDS = [
  "team",
  "source",
  "costs",
  "modelId",
  "credentials",
  "createdBy",
  "updatedAt",
  "accessGroups",
] as const;

export type ModelFieldId = (typeof MODEL_FIELD_IDS)[number];

export interface ModelFieldDefinition {
  id: ModelFieldId;
  translationKey: string;
  defaultFocusVisible: boolean;
  showInFocusCard: boolean;
}

export const MODEL_FIELDS: readonly ModelFieldDefinition[] = [
  { id: "team", translationKey: "focusModelsAndEndpoints.list.team", defaultFocusVisible: true, showInFocusCard: true },
  { id: "source", translationKey: "focusModelsAndEndpoints.list.source", defaultFocusVisible: true, showInFocusCard: true },
  { id: "costs", translationKey: "focusModelsAndEndpoints.list.costs", defaultFocusVisible: true, showInFocusCard: true },
  {
    id: "modelId",
    translationKey: "focusModelsAndEndpoints.list.fields.modelId",
    defaultFocusVisible: false,
    showInFocusCard: false,
  },
  {
    id: "credentials",
    translationKey: "focusModelsAndEndpoints.list.fields.credentials",
    defaultFocusVisible: true,
    showInFocusCard: true,
  },
  {
    id: "createdBy",
    translationKey: "focusModelsAndEndpoints.list.fields.createdBy",
    defaultFocusVisible: true,
    showInFocusCard: true,
  },
  {
    id: "updatedAt",
    translationKey: "focusModelsAndEndpoints.list.fields.updatedAt",
    defaultFocusVisible: true,
    showInFocusCard: true,
  },
  {
    id: "accessGroups",
    translationKey: "focusModelsAndEndpoints.list.fields.accessGroups",
    defaultFocusVisible: true,
    showInFocusCard: true,
  },
];

export const FOCUS_MODEL_CARD_FIELD_IDS = MODEL_FIELDS.filter((field) => field.showInFocusCard).map(
  (field) => field.id,
) as readonly Exclude<ModelFieldId, "modelId">[];

export const DEFAULT_FOCUS_MODEL_FIELD_VISIBILITY = Object.fromEntries(
  MODEL_FIELDS.map((field) => [field.id, field.defaultFocusVisible]),
) as Record<ModelFieldId, boolean>;

export const MODEL_TABLE_DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {
  model_info_db_model: false,
};
