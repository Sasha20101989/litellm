"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { DateCell, IdCell, IdentityCell, StatusBadge, type StatusTone } from "@/components/shared/table_cells";

import DefaultProxyAdminTag from "../common_components/DefaultProxyAdminTag";

export type AuditLogEntry = {
  id: string;
  updated_at: string;
  changed_by: string;
  changed_by_api_key: string;
  action: string;
  table_name: string;
  object_id: string;
  before_value: Record<string, unknown>;
  updated_values: Record<string, unknown>;
};

export const AUDIT_TABLE_NAME_DISPLAY: Record<string, string> = {
  LiteLLM_VerificationToken: "Keys",
  LiteLLM_TeamTable: "Teams",
  LiteLLM_UserTable: "Users",
  LiteLLM_OrganizationTable: "Organizations",
  LiteLLM_ProxyModelTable: "Models",
};

export const getAuditTableNameDisplay = (t: TFunction<"logs">): Record<string, string> => ({
  LiteLLM_VerificationToken: t("audit.tables.keys"),
  LiteLLM_TeamTable: t("audit.tables.teams"),
  LiteLLM_UserTable: t("audit.tables.users"),
  LiteLLM_OrganizationTable: t("audit.tables.organizations"),
  LiteLLM_ProxyModelTable: t("audit.tables.models"),
});

const ACTION_TONE: Record<string, StatusTone> = {
  created: "success",
  updated: "info",
  deleted: "error",
  rotated: "warning",
};

interface AuditLogsTableColumnsDeps {
  onViewLog: (log: AuditLogEntry) => void;
}

export const getAuditLogsTableColumns = (
  { onViewLog }: AuditLogsTableColumnsDeps,
  t: TFunction<"logs">,
): ColumnDef<AuditLogEntry>[] => [
  {
    id: "updated_at",
    accessorKey: "updated_at",
    header: t("audit.timestamp"),
    size: 200,
    enableSorting: false,
    cell: ({ row }) => <DateCell value={row.original.updated_at} />,
  },
  {
    id: "action",
    accessorKey: "action",
    header: t("audit.action"),
    size: 110,
    enableSorting: false,
    cell: ({ row }) => (
      <StatusBadge
        tone={ACTION_TONE[row.original.action] ?? "neutral"}
        label={t(`audit.actions.${row.original.action}`, { defaultValue: row.original.action })}
      />
    ),
  },
  {
    id: "table_name",
    accessorKey: "table_name",
    header: t("audit.table"),
    size: 130,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm">{getAuditTableNameDisplay(t)[row.original.table_name] ?? row.original.table_name}</span>
    ),
  },
  {
    id: "object_id",
    accessorKey: "object_id",
    header: t("audit.objectId"),
    minSize: 220,
    enableSorting: false,
    cell: ({ row }) => (
      <IdentityCell
        title={row.original.object_id}
        titleClassName="font-mono text-xs font-normal text-primary"
        className="max-w-72"
        onClick={() => onViewLog(row.original)}
      />
    ),
  },
  {
    id: "changed_by",
    accessorKey: "changed_by",
    header: t("audit.changedBy"),
    size: 200,
    enableSorting: false,
    cell: ({ row }) => <DefaultProxyAdminTag userId={row.original.changed_by} />,
  },
  {
    id: "changed_by_api_key",
    accessorKey: "changed_by_api_key",
    header: t("audit.apiKeyHash"),
    size: 160,
    enableSorting: false,
    cell: ({ row }) => <IdCell value={row.original.changed_by_api_key} variant="plain" />,
  },
];
