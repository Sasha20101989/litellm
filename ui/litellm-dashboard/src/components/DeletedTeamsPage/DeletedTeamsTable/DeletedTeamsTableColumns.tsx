"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { DataTableSortHeader } from "@/components/shared/DataTable";
import { DateCell, IdCell, ModelsCell, MoneyCell } from "@/components/shared/table_cells";
import { DeletedTeam } from "@/app/(dashboard)/hooks/teams/useTeams";

export const getDeletedTeamsTableColumns = (t: TFunction<"logs">): ColumnDef<DeletedTeam>[] => [
  {
    id: "team_alias",
    accessorKey: "team_alias",
    meta: { title: t("deleted.columns.teamName") },
    header: t("deleted.columns.teamName"),
    size: 150,
    enableSorting: false,
    cell: ({ row }) => {
      const value = row.original.team_alias;
      if (!value) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <span className="block max-w-60 truncate font-medium" title={value}>
          {value}
        </span>
      );
    },
  },
  {
    id: "team_id",
    accessorKey: "team_id",
    meta: { title: t("deleted.columns.teamId") },
    header: t("deleted.columns.teamId"),
    size: 150,
    enableSorting: false,
    cell: ({ row }) => <IdCell value={row.original.team_id} variant="plain" />,
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    meta: { title: t("deleted.columns.created") },
    header: ({ column }) => <DataTableSortHeader column={column} title={t("deleted.columns.created")} />,
    size: 120,
    enableSorting: true,
    cell: ({ row }) => <DateCell value={row.original.created_at} precision="date" />,
  },
  {
    id: "spend",
    accessorKey: "spend",
    meta: { title: t("deleted.columns.spend"), numeric: true },
    header: ({ column }) => <DataTableSortHeader column={column} title={t("deleted.columns.spend")} />,
    size: 100,
    enableSorting: true,
    cell: ({ row }) => <MoneyCell value={row.original.spend} decimals={4} />,
  },
  {
    id: "max_budget",
    accessorKey: "max_budget",
    meta: { title: t("deleted.columns.budget"), numeric: true },
    header: t("deleted.columns.budget"),
    size: 110,
    enableSorting: false,
    cell: ({ row }) => <MoneyCell value={row.original.max_budget} decimals={0} emptyText={t("deleted.unlimited")} showZero />,
  },
  {
    id: "models",
    accessorKey: "models",
    meta: { title: t("deleted.columns.models"), skeleton: "chips" },
    header: t("deleted.columns.models"),
    size: 200,
    enableSorting: false,
    cell: ({ row }) => <ModelsCell models={row.original.models} />,
  },
  {
    id: "organization_id",
    accessorKey: "organization_id",
    meta: { title: t("deleted.columns.organization") },
    header: t("deleted.columns.organization"),
    size: 150,
    enableSorting: false,
    cell: ({ row }) => <IdCell value={row.original.organization_id} variant="plain" />,
  },
  {
    id: "deleted_at",
    accessorKey: "deleted_at",
    meta: { title: t("deleted.columns.deletedAt") },
    header: ({ column }) => <DataTableSortHeader column={column} title={t("deleted.columns.deletedAt")} />,
    size: 120,
    enableSorting: true,
    cell: ({ row }) => <DateCell value={row.original.deleted_at} precision="date" />,
  },
  {
    id: "deleted_by",
    accessorKey: "deleted_by",
    meta: { title: t("deleted.columns.deletedBy") },
    header: t("deleted.columns.deletedBy"),
    size: 120,
    enableSorting: false,
    cell: ({ row }) => {
      const value = row.original.deleted_by;
      if (!value) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <span className="block max-w-60 truncate" title={value}>
          {value}
        </span>
      );
    },
  },
];
