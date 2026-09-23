"use client";

import { ModelData } from "@/components/model_dashboard/types";
import { ProviderLogo } from "@/components/molecules/models/ProviderLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { getDisplayModelName } from "@/components/view_model/model_name_display";
import { Columns3, Loader2, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

const FOCUS_MODEL_FIELDS = [
  "team",
  "source",
  "costs",
  "modelId",
  "credentials",
  "createdBy",
  "updatedAt",
  "accessGroups",
] as const;

export type FocusModelField = (typeof FOCUS_MODEL_FIELDS)[number];

function formatDate(value: string | null | undefined, locale: string): string {
  if (!value || Number.isNaN(Date.parse(value))) return "-";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

export function FocusModelCard({
  model,
  selected,
  teamName,
  locale,
  visibleFields,
  canEdit,
  canTogglePause,
  isPausing,
  onSelect,
  onPauseToggle,
  onDelete,
}: {
  model: ModelData;
  selected: boolean;
  teamName: string;
  locale: string;
  visibleFields: Record<FocusModelField, boolean>;
  canEdit: boolean;
  canTogglePause: boolean;
  isPausing: boolean;
  onSelect: () => void;
  onPauseToggle: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation("gateway");
  const isBlocked = model.model_info?.blocked === true;
  const displayName = getDisplayModelName(model);
  const hasCosts = model.input_cost != null || model.output_cost != null;
  const isConfigModel = !model.model_info?.db_model;
  const credentialName = model.litellm_params?.litellm_credential_name;
  const createdBy = isConfigModel ? t("models.definedInConfig") : model.model_info?.created_by || t("models.unknown");
  const accessGroups = model.model_info?.access_groups ?? [];
  const fields: Array<[FocusModelField, string, ReactNode]> = [
    [
      "modelId",
      t("focusModelsAndEndpoints.list.fields.modelId"),
      <span key="model-id" className="font-mono text-xs">
        {model.model_info?.id || "-"}
      </span>,
    ],
    [
      "credentials",
      t("focusModelsAndEndpoints.list.fields.credentials"),
      credentialName ? (
        credentialName
      ) : (
        <span key="credentials" className="text-muted-foreground">
          {t("models.manual")}
        </span>
      ),
    ],
    [
      "createdBy",
      t("focusModelsAndEndpoints.list.fields.createdBy"),
      <span key="created-by">
        {createdBy}
        {!isConfigModel && (
          <span className="block text-xs text-muted-foreground">
            {formatDate(model.model_info?.created_at, locale)}
          </span>
        )}
      </span>,
    ],
    ["updatedAt", t("focusModelsAndEndpoints.list.fields.updatedAt"), formatDate(model.model_info?.updated_at, locale)],
    [
      "accessGroups",
      t("focusModelsAndEndpoints.list.fields.accessGroups"),
      accessGroups.length ? (
        <span className="flex flex-wrap gap-1">
          {accessGroups.map((group) => (
            <Badge key={group} variant="outline" className="font-normal">
              {group}
            </Badge>
          ))}
        </span>
      ) : (
        "-"
      ),
    ],
  ];

  return (
    <article
      role="button"
      tabIndex={0}
      aria-current={selected ? "true" : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`focus-model-row cursor-pointer rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? "focus-model-row-selected" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="focus-model-glyph grid size-9 shrink-0 place-items-center rounded-lg">
          {model.provider && model.provider !== "-" ? (
            <ProviderLogo provider={model.provider} className="size-5" />
          ) : (
            <span className="text-xs">-</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground" title={displayName}>
                {displayName}
              </p>
              <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground" title={model.litellm_model_name}>
                {model.litellm_model_name || "-"}
              </p>
            </div>
            <ModelActions
              model={model}
              canEdit={canEdit}
              canTogglePause={canTogglePause}
              isPausing={isPausing}
              onPauseToggle={onPauseToggle}
              onDelete={onDelete}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant={isBlocked ? "destructive" : "secondary"} className="font-normal">
              {isBlocked
                ? t("focusModelsAndEndpoints.list.status.paused")
                : t("focusModelsAndEndpoints.list.status.active")}
            </Badge>
            <span className="max-w-44 truncate text-muted-foreground" title={model.provider}>
              {model.provider || t("models.unknownProvider")}
            </span>
          </div>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-border pt-3 text-sm">
        {visibleFields.team && (
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{t("focusModelsAndEndpoints.list.team")}</dt>
            <dd className="mt-0.5 truncate text-foreground" title={teamName}>
              {teamName}
            </dd>
          </div>
        )}
        {visibleFields.source && (
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{t("focusModelsAndEndpoints.list.source")}</dt>
            <dd className="mt-0.5 truncate text-foreground">
              {model.model_info?.db_model ? t("models.dbModel") : t("models.configModel")}
            </dd>
          </div>
        )}
        {visibleFields.costs && (
          <div className="col-span-2 min-w-0">
            <dt className="text-xs text-muted-foreground">{t("focusModelsAndEndpoints.list.costs")}</dt>
            <dd className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 tabular-nums text-foreground">
              {hasCosts ? (
                <>
                  {model.input_cost != null && (
                    <span>
                      {t("models.input")} ${model.input_cost}
                    </span>
                  )}
                  {model.output_cost != null && (
                    <span>
                      {t("models.output")} ${model.output_cost}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </dd>
          </div>
        )}
        {fields
          .filter(([field]) => visibleFields[field])
          .map(([field, label, value]) => (
            <div key={field} className={field === "accessGroups" ? "col-span-2 min-w-0" : "min-w-0"}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 min-w-0 break-words text-foreground">{value}</dd>
            </div>
          ))}
      </dl>
    </article>
  );
}

export function FocusModelFieldsVisibility({
  visibility,
  onChange,
}: {
  visibility: Record<FocusModelField, boolean>;
  onChange: (next: Record<FocusModelField, boolean>) => void;
}) {
  const { t } = useTranslation("gateway");

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Columns3 className="size-4" />
        {t("focusModelsAndEndpoints.list.visibility.action")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("focusModelsAndEndpoints.list.visibility.title")}</DialogTitle>
          <DialogDescription>{t("focusModelsAndEndpoints.list.visibility.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {FOCUS_MODEL_FIELDS.map((field) => (
            <label key={field} className="flex items-center justify-between gap-4 text-sm">
              <span>{t(`focusModelsAndEndpoints.list.fields.${field}`)}</span>
              <Switch
                checked={visibility[field]}
                onCheckedChange={(checked) => onChange({ ...visibility, [field]: checked })}
                aria-label={t(`focusModelsAndEndpoints.list.fields.${field}`)}
              />
            </label>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ModelActions({
  model,
  canEdit,
  canTogglePause,
  isPausing,
  onPauseToggle,
  onDelete,
}: {
  model: ModelData;
  canEdit: boolean;
  canTogglePause: boolean;
  isPausing: boolean;
  onPauseToggle: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation("gateway");
  const isBlocked = model.model_info?.blocked === true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("focusModelsAndEndpoints.list.actions.open", { name: getDisplayModelName(model) })}
        onClick={(event) => event.stopPropagation()}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isPausing ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem
          disabled={!canTogglePause || isPausing}
          onClick={(event) => {
            event.stopPropagation();
            onPauseToggle();
          }}
        >
          {isBlocked ? <Play /> : <Pause />}
          {isBlocked
            ? t("focusModelsAndEndpoints.list.actions.resume")
            : t("focusModelsAndEndpoints.list.actions.pause")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={!canEdit}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 />
          {t("focusModelsAndEndpoints.list.actions.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
