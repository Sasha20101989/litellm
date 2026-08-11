"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";

import { StatusBadge, type StatusTone } from "@/components/shared/table_cells";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentUpload } from "@/components/vector_store_management/types";
import { cn } from "@/lib/cva.config";
import { copyToClipboard } from "@/utils/dataUtils";
import type { TFunction } from "i18next";

const STATUS_CONFIG: Record<DocumentUpload["status"], { tone: StatusTone; key: string }> = {
  uploading: { tone: "info", key: "uploading" },
  done: { tone: "success", key: "done" },
  error: { tone: "error", key: "error" },
  removed: { tone: "neutral", key: "removed" },
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "-";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function DocumentRowActions({
  document,
  onRemove,
  t,
}: {
  document: DocumentUpload;
  onRemove: (uid: string) => void;
  t: TFunction;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("vectorStores.documents.actions.open")}
        data-testid={`document-actions-${document.uid}`}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-muted-foreground")}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          data-testid="document-action-copy"
          onClick={() => void copyToClipboard(document.uid, t("vectorStores.documents.actions.copied"))}
        >
          <Copy />
          {t("vectorStores.documents.actions.copy")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          data-testid="document-action-remove"
          onClick={() => onRemove(document.uid)}
        >
          <Trash2 />
          {t("vectorStores.documents.actions.remove")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DocumentsTableColumnsDeps {
  onRemove: (uid: string) => void;
  t: TFunction;
}

export const getDocumentsTableColumns = ({ onRemove, t }: DocumentsTableColumnsDeps): ColumnDef<DocumentUpload>[] => [
  {
    id: "name",
    accessorKey: "name",
    meta: { title: t("vectorStores.documents.columns.name") },
    header: t("vectorStores.documents.columns.name"),
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="block max-w-72 truncate text-sm" title={row.original.name}>
          {row.original.name}
        </span>
        {row.original.size ? (
          <span className="text-xs text-muted-foreground">({formatFileSize(row.original.size)})</span>
        ) : null}
      </div>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    meta: { title: t("vectorStores.documents.columns.status"), skeleton: "badge" },
    header: t("vectorStores.documents.columns.status"),
    size: 150,
    enableSorting: false,
    cell: ({ row }) => {
      const config = STATUS_CONFIG[row.original.status];
      return (
        <StatusBadge
          tone={config?.tone ?? "neutral"}
          label={config ? t(`vectorStores.documents.statuses.${config.key}`) : row.original.status}
        />
      );
    },
  },
  {
    id: "actions",
    meta: { className: "text-right", headerClassName: "text-right" },
    header: () => <span className="sr-only">{t("vectorStores.documents.columns.actions")}</span>,
    size: 64,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DocumentRowActions document={row.original} onRemove={onRemove} t={t} />
      </div>
    ),
  },
];
