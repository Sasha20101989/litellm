"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { DataTableSortHeader } from "@/components/shared/DataTable";
import { DateCell, IdCell, MoneyCell } from "@/components/shared/table_cells";
import { DeletedKeyResponse } from "@/app/(dashboard)/hooks/keys/useKeys";

function TruncatedTextCell({ value }: { value: string | null | undefined }) {
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <span className="block max-w-60 truncate" title={value}>
      {value}
    </span>
  );
}

export const getDeletedKeysTableColumns = (t: TFunction<"logs">): ColumnDef<DeletedKeyResponse>[] => [
  {
    id: "token",
    accessorKey: "token",
    meta: { title: t("deleted.columns.keyId") },
    header: t("deleted.columns.keyId"),
    size: 150,
    enableSorting: false,
    cell: ({ row }) => <IdCell value={row.original.token} variant="plain" />,
  },
  {
    id: "key_alias",
    accessorKey: "key_alias",
    meta: { title: t("deleted.columns.keyAlias") },
    header: t("deleted.columns.keyAlias"),
    size: 150,
    enableSorting: false,
    cell: ({ row }) => {
      const value = row.original.key_alias;
      if (!value) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <span className="block max-w-60 truncate font-mono text-xs" title={value}>
          {value}
        </span>
      );
    },
  },
  {
    id: "team_alias",
    accessorKey: "team_alias",
    meta: { title: t("deleted.columns.teamAlias") },
    header: t("deleted.columns.teamAlias"),
    size: 120,
    enableSorting: false,
    cell: ({ row }) => <TruncatedTextCell value={row.original.team_alias} />,
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
    id: "user_email",
    accessorKey: "user_email",
    meta: { title: t("deleted.columns.userEmail") },
    header: t("deleted.columns.userEmail"),
    size: 160,
    enableSorting: false,
    cell: ({ row }) => <TruncatedTextCell value={row.original.user_email} />,
  },
  {
    id: "user_id",
    accessorKey: "user_id",
    meta: { title: t("deleted.columns.userId") },
    header: t("deleted.columns.userId"),
    size: 120,
    enableSorting: false,
    cell: ({ row }) => <IdCell value={row.original.user_id} variant="plain" />,
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    meta: { title: t("deleted.columns.createdAt") },
    header: ({ column }) => <DataTableSortHeader column={column} title={t("deleted.columns.createdAt")} />,
    size: 120,
    enableSorting: true,
    cell: ({ row }) => <DateCell value={row.original.created_at} precision="date" />,
  },
  {
    id: "created_by",
    accessorKey: "created_by",
    meta: { title: t("deleted.columns.createdBy") },
    header: t("deleted.columns.createdBy"),
    size: 120,
    enableSorting: false,
    cell: ({ row }) => <TruncatedTextCell value={row.original.created_by} />,
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
    cell: ({ row }) => <TruncatedTextCell value={row.original.deleted_by} />,
  },
];
