"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Copy, Info, Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";

import { ProviderLogo } from "@/components/molecules/models/ProviderLogo";
import { ModelData } from "@/components/model_dashboard/types";
import { DataTableSortHeader } from "@/components/shared/DataTable";
import { CellTooltip, DateCell, formatCellDate, IdCell, StatusBadge } from "@/components/shared/table_cells";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Switch } from "@/components/ui/switch";
import { getDisplayModelName } from "@/components/view_model/model_name_display";
import { copyToClipboard } from "@/utils/dataUtils";
import { getModelField, MODEL_TABLE_FIELD_IDS, type ModelFieldId } from "@/features/models-and-endpoints/modelFields";
import {
  ACCESS_GROUPS_COLUMN_ID,
  COSTS_COLUMN_ID,
  CREATED_BY_COLUMN_ID,
  CREDENTIALS_COLUMN_ID,
  MODEL_ID_COLUMN_ID,
  MODEL_NAME_COLUMN_ID,
  MODEL_TABLE_SORT_COLUMN_IDS,
  STATUS_COLUMN_ID,
  TEAM_ID_COLUMN_ID,
  toServerSortField,
  type ModelCapabilities,
  type ModelTableSortColumnId,
  UPDATED_AT_COLUMN_ID,
} from "@/features/models-and-endpoints/modelWorkspaceContract";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

export {
  ACCESS_GROUPS_COLUMN_ID,
  COSTS_COLUMN_ID,
  CREATED_BY_COLUMN_ID,
  CREDENTIALS_COLUMN_ID,
  MODEL_ID_COLUMN_ID,
  MODEL_NAME_COLUMN_ID,
  MODEL_TABLE_SORT_COLUMN_IDS,
  STATUS_COLUMN_ID,
  TEAM_ID_COLUMN_ID,
  toServerSortField,
  type ModelCapabilities,
  type ModelTableSortColumnId,
  UPDATED_AT_COLUMN_ID,
};

const formatShortDate = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : formatCellDate(date, "date");
};

function ModelInformationCell({ model, displayName }: { model: ModelData; displayName: string }) {
  const { t } = useTranslation("gateway");
  const litellmModelName = model.litellm_model_name || "-";

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <div className="flex min-w-0 items-center gap-2.5" data-testid={`model-information-${model.model_info.id}`} />
        }
      >
        {model.provider ? (
          <ProviderLogo provider={model.provider} className="size-6 shrink-0" />
        ) : (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
            -
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="max-w-60 truncate text-sm font-medium text-foreground" title={displayName}>
            {displayName}
          </span>
          <span className="max-w-60 truncate font-mono text-xs text-muted-foreground" title={litellmModelName}>
            {litellmModelName}
          </span>
        </span>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {model.provider ? <ProviderLogo provider={model.provider} className="size-4 shrink-0" /> : null}
            <span className="truncate text-xs text-muted-foreground">{model.provider || t("models.unknownProvider")}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{t("models.filters.publicName")}</span>
            <span className="truncate text-sm font-medium text-foreground" title={displayName}>
              {displayName}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{t("models.deleteModal.litellmName")}</span>
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate font-mono text-sm text-foreground" title={litellmModelName}>
                {litellmModelName}
              </span>
              <button
                type="button"
                aria-label={t("models.copyLiteLlmName")}
                data-testid={`copy-litellm-model-name-${model.model_info.id}`}
                className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => void copyToClipboard(litellmModelName, t("models.litellmNameCopied"))}
              >
                <Copy className="size-3.5" />
              </button>
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function CredentialsHeader() {
  const { t } = useTranslation("gateway");
  return (
    <span className="flex items-center gap-1">
      {t(getModelField("credentials").table.translationKey)}
      <HoverCard>
        <HoverCardTrigger
          render={
            <button
              type="button"
              aria-label={t("models.aboutCredentialTypes")}
              data-testid="credentials-header-info"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            />
          }
        >
          <Info className="size-3.5" />
        </HoverCardTrigger>
        <HoverCardContent align="start" className="w-80">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-foreground">{t("models.credentialTypes")}</span>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-info">
                <RefreshCw className="size-3.5" />
                {t("models.reusable")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("models.reusableDescription")}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Pencil className="size-3.5" />
                {t("models.manual")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("models.manualDescription")}
              </span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </span>
  );
}

function CredentialsCell({ credentialName }: { credentialName: string | undefined }) {
  const { t } = useTranslation("gateway");
  if (!credentialName) {
    return (
      <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
        <Pencil className="size-3" />
        {t("models.manual")}
      </Badge>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-info" title={credentialName}>
      <RefreshCw className="size-3 shrink-0" />
      <span className="truncate">{credentialName}</span>
    </span>
  );
}

function CreatedByCell({ model }: { model: ModelData }) {
  const { t } = useTranslation("gateway");
  const isConfigModel = !model.model_info?.db_model;
  const createdAt = formatShortDate(model.model_info.created_at);
  const primary = isConfigModel ? t("models.definedInConfig") : model.model_info.created_by || t("models.unknown");
  const secondaryForDbModel = createdAt ?? t("models.unknownDate");

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="max-w-44 truncate text-sm text-foreground" title={primary}>
        {primary}
      </span>
      <span className="truncate text-xs text-muted-foreground">{isConfigModel ? "-" : secondaryForDbModel}</span>
    </div>
  );
}

function CostsCell({ model }: { model: ModelData }) {
  const { t } = useTranslation("gateway");
  const { input_cost: inputCost, output_cost: outputCost } = model;
  const outputCostPerSecond = model.output_cost_per_second;
  const hideZeroTokenCost = outputCostPerSecond != null;
  const showInputCost = inputCost != null && (!hideZeroTokenCost || inputCost !== "0.00");
  const showOutputCost = outputCost != null && (!hideZeroTokenCost || outputCost !== "0.00");

  if (!showInputCost && !showOutputCost && outputCostPerSecond == null) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  return (
    <CellTooltip
      content={t("models.costPerMillion")}
      trigger={
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
          {showInputCost && (
            <span className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">{t("models.input")}</span>
              <span className="text-xs font-medium tabular-nums text-foreground">${inputCost}</span>
            </span>
          )}
          {showOutputCost && (
            <span className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">{t("models.output")}</span>
              <span className="text-xs font-medium tabular-nums text-foreground">${outputCost}</span>
            </span>
          )}
          {outputCostPerSecond != null && (
            <span className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">{t("models.output")}</span>
              <span className="text-xs font-medium tabular-nums text-foreground">
                ${outputCostPerSecond.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}/{t("models.perSecond")}
              </span>
            </span>
          )}
        </div>
      }
    />
  );
}

function AccessGroupsCell({ accessGroups }: { accessGroups: string[] | null }) {
  const { t } = useTranslation("gateway");
  if (!accessGroups || accessGroups.length === 0) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  const [first, ...overflow] = accessGroups;

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Badge variant="outline" className="max-w-36 truncate border-info/20 bg-info/10 font-normal text-info">
        {first}
      </Badge>
      {overflow.length > 0 && (
        <CellTooltip
          content={
            <div className="flex max-w-[280px] flex-col gap-0.5">
              {overflow.map((group) => (
                <span key={group}>{group}</span>
              ))}
            </div>
          }
          trigger={
            <Badge variant="outline" className="shrink-0 cursor-default font-normal">
              {t("models.more", { count: overflow.length })}
            </Badge>
          }
        />
      )}
    </div>
  );
}

interface ModelRowActionsProps {
  model: ModelData;
  capabilities: ModelCapabilities;
  isPausing: boolean;
  onDeleteClick?: (modelId: string) => void;
  onTogglePauseClick?: (modelId: string, blocked: boolean) => void | Promise<void>;
}

function ModelRowActions({
  model,
  capabilities,
  isPausing,
  onDeleteClick,
  onTogglePauseClick,
}: ModelRowActionsProps) {
  const { t } = useTranslation("gateway");
  const modelId = model.model_info?.id;
  const isConfigModel = !model.model_info?.db_model;
  const isBlocked = model.model_info?.blocked === true;
  const isPauseToggleable = !isConfigModel && capabilities.canTogglePause && Boolean(onTogglePauseClick);

  const resolvePauseTooltip = (): string => {
    if (isConfigModel) {
      return t("models.pause.configDisabled");
    }
    if (!capabilities.canTogglePause) {
      return t("models.pause.adminOnly");
    }
    return isBlocked ? t("models.pause.resumeTooltip") : t("models.pause.pauseTooltip");
  };

  const deleteTooltip = isConfigModel ? t("models.delete.configDisabled") : t("models.delete.action");

  return (
    <div className="flex items-center justify-end gap-1.5">
      <span className="flex w-8 shrink-0 items-center justify-center">
        {isPausing ? (
          <Loader2
            className="size-4 animate-spin text-muted-foreground"
            data-testid={`model-pause-pending-${modelId}`}
          />
        ) : (
          <CellTooltip
            content={resolvePauseTooltip()}
            trigger={
              <span className="inline-flex">
                <Switch
                  size="sm"
                  checked={!isBlocked}
                  disabled={!isPauseToggleable}
                  aria-label={isBlocked ? t("models.pause.resume") : t("models.pause.pause")}
                  data-testid={`model-pause-toggle-${modelId}`}
                  onCheckedChange={(nextChecked) => {
                    if (isPauseToggleable && onTogglePauseClick && modelId) {
                      void onTogglePauseClick(modelId, !nextChecked);
                    }
                  }}
                />
              </span>
            }
          />
        )}
      </span>
      <CellTooltip
        content={deleteTooltip}
        trigger={
          <span className="inline-flex">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("models.delete.action")}
              data-testid={`model-delete-${modelId}`}
              disabled={isConfigModel || !capabilities.canDelete}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                if (onDeleteClick && modelId) {
                  onDeleteClick(modelId);
                }
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </span>
        }
      />
    </div>
  );
}

export interface ModelsTableColumnDeps {
  getModelCapabilities: (model: ModelData) => ModelCapabilities;
  onModelIdClick: (modelId: string) => void;
  onTeamIdClick: (teamId: string) => void;
  onDeleteClick?: (modelId: string) => void;
  onTogglePauseClick?: (modelId: string, blocked: boolean) => void | Promise<void>;
  pausingModelId?: string | null;
  t: TFunction<"gateway">;
}

export const getModelsTableColumns = ({
  getModelCapabilities,
  onModelIdClick,
  onTeamIdClick,
  onDeleteClick,
  onTogglePauseClick,
  pausingModelId,
  t,
}: ModelsTableColumnDeps): ColumnDef<ModelData>[] => {
  const columnsByField: Record<ModelFieldId, ColumnDef<ModelData>> = {
  modelId: {
    id: MODEL_ID_COLUMN_ID,
    accessorFn: (row) => row.model_info.id,
    meta: { title: t(getModelField("modelId").table.translationKey) },
    header: t(getModelField("modelId").table.translationKey),
    enableSorting: false,
    size: 140,
    minSize: 90,
    cell: ({ row }) => (
      <IdCell
        value={row.original.model_info.id}
        onClick={onModelIdClick}
        dataTestId={`model-id-${row.original.model_info.id}`}
      />
    ),
  },
  modelName: {
    id: MODEL_NAME_COLUMN_ID,
    accessorFn: (row) => row.model_name ?? "",
    meta: { title: t(getModelField("modelName").table.translationKey), skeleton: "twoLine" },
    header: ({ column }) => <DataTableSortHeader column={column} title={t(getModelField("modelName").table.translationKey)} />,
    enableSorting: true,
    size: 280,
    minSize: 160,
    cell: ({ row }) => (
      <ModelInformationCell model={row.original} displayName={getDisplayModelName(row.original) || "-"} />
    ),
  },
  credentials: {
    id: CREDENTIALS_COLUMN_ID,
    accessorFn: (row) => row.litellm_params?.litellm_credential_name ?? "",
    meta: { title: t(getModelField("credentials").table.translationKey) },
    header: () => <CredentialsHeader />,
    enableSorting: false,
    size: 180,
    minSize: 110,
    cell: ({ row }) => <CredentialsCell credentialName={row.original.litellm_params?.litellm_credential_name} />,
  },
  createdBy: {
    id: CREATED_BY_COLUMN_ID,
    accessorFn: (row) => row.model_info.created_by ?? "",
    meta: { title: t(getModelField("createdBy").table.translationKey), skeleton: "twoLine" },
    header: ({ column }) => <DataTableSortHeader column={column} title={t(getModelField("createdBy").table.translationKey)} />,
    enableSorting: true,
    size: 180,
    minSize: 110,
    cell: ({ row }) => <CreatedByCell model={row.original} />,
  },
  updatedAt: {
    id: UPDATED_AT_COLUMN_ID,
    accessorFn: (row) => row.model_info.updated_at ?? "",
    meta: { title: t(getModelField("updatedAt").table.translationKey) },
    header: ({ column }) => <DataTableSortHeader column={column} title={t(getModelField("updatedAt").table.translationKey)} />,
    enableSorting: true,
    size: 140,
    minSize: 100,
    cell: ({ row }) => <DateCell value={row.original.model_info.updated_at} precision="date" />,
  },
  costs: {
    id: COSTS_COLUMN_ID,
    accessorFn: (row) => row.input_cost,
    meta: { title: t(getModelField("costs").table.translationKey) },
    header: ({ column }) => <DataTableSortHeader column={column} title={t(getModelField("costs").table.translationKey)} />,
    enableSorting: true,
    size: 130,
    minSize: 90,
    cell: ({ row }) => <CostsCell model={row.original} />,
  },
  team: {
    id: TEAM_ID_COLUMN_ID,
    accessorFn: (row) => row.model_info.team_id ?? "",
    meta: { title: t(getModelField("team").table.translationKey) },
    header: t(getModelField("team").table.translationKey),
    enableSorting: false,
    size: 140,
    minSize: 90,
    cell: ({ row }) => (
      <IdCell
        value={row.original.model_info.team_id}
        onClick={onTeamIdClick}
        dataTestId={`model-team-id-${row.original.model_info.id}`}
      />
    ),
  },
  accessGroups: {
    id: ACCESS_GROUPS_COLUMN_ID,
    accessorFn: (row) => row.model_info.access_groups ?? [],
    meta: { title: t(getModelField("accessGroups").table.translationKey), skeleton: "chips" },
    header: t(getModelField("accessGroups").table.translationKey),
    enableSorting: false,
    size: 200,
    minSize: 120,
    cell: ({ row }) => <AccessGroupsCell accessGroups={row.original.model_info.access_groups} />,
  },
  source: {
    id: STATUS_COLUMN_ID,
    accessorFn: (row) => row.model_info.db_model,
    meta: { title: t(getModelField("source").table.translationKey), skeleton: "badge" },
    header: ({ column }) => <DataTableSortHeader column={column} title={t(getModelField("source").table.translationKey)} />,
    enableSorting: true,
    size: 140,
    minSize: 100,
    cell: ({ row }) =>
      row.original.model_info.db_model ? (
        <StatusBadge tone="info" label={t("models.dbModel")} />
      ) : (
        <StatusBadge tone="neutral" label={t("models.configModel")} />
      ),
  },
  };

  return [
    ...MODEL_TABLE_FIELD_IDS.map((field) => columnsByField[field]),
    {
    id: "actions",
    meta: { title: t("models.columns.actions"), className: "text-right", headerClassName: "text-right" },
    header: t("models.columns.actions"),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 110,
    minSize: 110,
    cell: ({ row }) => (
      <ModelRowActions
        model={row.original}
        capabilities={getModelCapabilities(row.original)}
        isPausing={pausingModelId === row.original.model_info?.id}
        onDeleteClick={onDeleteClick}
        onTogglePauseClick={onTogglePauseClick}
      />
    ),
    },
  ];
};
