"use client";

import { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { KeyRound } from "lucide-react";
import { useMemo } from "react";

import { KeyResponse } from "@/components/key_team_helpers/key_list";
import { DataTable } from "@/components/shared/DataTable";

import { getProjectKeysTableColumns } from "./ProjectKeysTableColumns";
import { useTranslation } from "react-i18next";

interface ProjectKeysTableProps {
  keys: KeyResponse[];
  totalCount: number;
  isLoading: boolean;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
}

const PAGE_SIZE_OPTIONS = [5, 10, 25];

function EmptyState() {
  const { t } = useTranslation("management");
  return (
    <div className="flex flex-col items-center gap-1 py-6">
      <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-muted">
        <KeyRound className="size-5 text-muted-foreground" />
      </div>
      <div className="text-sm font-medium text-foreground">{t("projects.noKeys")}</div>
      <div className="text-sm text-muted-foreground">{t("projects.noKeysDescription")}</div>
    </div>
  );
}

export function ProjectKeysTable({
  keys,
  totalCount,
  isLoading,
  pagination,
  onPaginationChange,
}: ProjectKeysTableProps) {
  const { t } = useTranslation("management");
  const columns = useMemo(() => getProjectKeysTableColumns(t), [t]);

  return (
    <DataTable
      data={keys}
      columns={columns}
      getRowId={(key, index) => key.token || String(index)}
      paginationMode="server"
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      rowCount={totalCount}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      isLoading={isLoading}
      loadingMessage={t("projects.keysLoading")}
      noDataMessage={<EmptyState />}
      size="compact"
    />
  );
}
