"use client";

import { useCredentialsWorkspace } from "@/features/models-and-endpoints/useCredentialsWorkspace";
import DeleteResourceModal from "@/components/common_components/DeleteResourceModal";
import { ProviderLogo } from "@/components/molecules/models/ProviderLogo";
import { type CredentialItem } from "@/components/networking";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { copyToClipboard } from "@/utils/dataUtils";
import { Copy, KeyRound, Loader2, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FocusCredentialModal } from "./FocusCredentialModal";

type ModalMode = "add" | "edit" | null;

interface CredentialListProps {
  credentials: CredentialItem[];
  isLoading: boolean;
  isError: boolean;
  hasSearch: boolean;
  canModify: boolean;
  onEdit: (credential: CredentialItem) => void;
  onDelete: (credential: CredentialItem) => void;
}

function CredentialList({
  credentials,
  isLoading,
  isError,
  hasSearch,
  canModify,
  onEdit,
  onDelete,
}: CredentialListProps) {
  const { t } = useTranslation("gateway");
  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t("models.credentials.loading")}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex min-h-48 items-center justify-center text-sm text-destructive">
        {t("models.credentials.loadFailed")}
      </div>
    );
  }
  if (credentials.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center">
        <div className="grid size-11 place-items-center rounded-xl bg-muted">
          <KeyRound className="size-5 text-muted-foreground" />
        </div>
        <h3 className="mt-3 text-sm font-semibold">{t("models.credentials.emptyTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(hasSearch ? "models.credentials.searchEmpty" : "models.credentials.emptyDescription")}
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {credentials.map((credential) => (
        <CredentialCard
          key={credential.credential_name}
          credential={credential}
          canModify={canModify}
          onEdit={() => onEdit(credential)}
          onDelete={() => onDelete(credential)}
        />
      ))}
    </div>
  );
}

function CredentialCard({
  credential,
  canModify,
  onEdit,
  onDelete,
}: {
  credential: CredentialItem;
  canModify: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation("gateway");
  const provider = credential.credential_info?.custom_llm_provider;

  return (
    <article className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-muted/20">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {provider ? <ProviderLogo provider={provider} className="size-5" /> : <KeyRound className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground">{credential.credential_name}</h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {provider || t("models.credentials.unknownProvider")}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("models.credentials.actions.copy")}
        onClick={() => void copyToClipboard(credential.credential_name, t("models.credentials.actions.copied"))}
      >
        <Copy className="size-4" />
      </Button>
      {canModify && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label={t("models.credentials.actions.open")} />}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              {t("models.credentials.actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" />
              {t("models.credentials.actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </article>
  );
}

export function FocusLlmCredentialsPanel() {
  const { t } = useTranslation("gateway");
  const workspace = useCredentialsWorkspace();
  const { credentials: allCredentials, isLoading, isError, canModifyCredentials: canModify } = workspace;
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCredential, setSelectedCredential] = useState<CredentialItem | null>(null);
  const [credentialToDelete, setCredentialToDelete] = useState<CredentialItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const credentials = useMemo(
    () =>
      [...allCredentials]
        .filter((credential) => {
          const query = search.trim().toLowerCase();
          if (!query) return true;
          return (
            credential.credential_name.toLowerCase().includes(query) ||
            credential.credential_info?.custom_llm_provider?.toLowerCase().includes(query)
          );
        })
        .sort((left, right) => left.credential_name.localeCompare(right.credential_name)),
    [allCredentials, search],
  );

  const closeModal = () => {
    setModalMode(null);
    setSelectedCredential(null);
  };
  const openEdit = (credential: CredentialItem) => {
    setSelectedCredential(credential);
    setModalMode("edit");
  };
  const saveCredential = async (values: Record<string, unknown>) => {
    if (!modalMode) return;
    setIsSaving(true);
    try {
      if (modalMode === "edit") {
        if (!(await workspace.updateCredential(values))) return;
        toast.success(t("models.credentials.notifications.updated"));
      } else {
        if (!(await workspace.createCredential(values))) return;
        toast.success(t("models.credentials.notifications.added"));
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save credential:", error);
      toast.fromError(
        t(
          modalMode === "edit"
            ? "models.credentials.notifications.updateFailed"
            : "models.credentials.notifications.addFailed",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };
  const deleteCredential = async () => {
    if (!credentialToDelete) return;
    setIsDeleting(true);
    try {
      if (!(await workspace.deleteCredential(credentialToDelete.credential_name))) return;
      toast.success(t("models.credentials.notifications.deleted"));
      setCredentialToDelete(null);
    } catch (error) {
      console.error("Failed to delete credential:", error);
      toast.fromError(t("models.credentials.notifications.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t("focusModelsAndEndpoints.innerTabs.llmCredentials")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("models.credentials.description")}</p>
        </div>
        {canModify && (
          <Button onClick={() => setModalMode("add")}>
            <Plus className="size-4" />
            {t("models.credentials.add")}
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
          placeholder={t("models.credentials.search")}
          aria-label={t("models.credentials.search")}
        />
      </div>

      <CredentialList
        credentials={credentials}
        isLoading={isLoading}
        isError={isError}
        hasSearch={Boolean(search.trim())}
        canModify={canModify}
        onEdit={openEdit}
        onDelete={setCredentialToDelete}
      />

      {modalMode && (
        <FocusCredentialModal
          key={`${modalMode}-${selectedCredential?.credential_name ?? "new"}`}
          open
          mode={modalMode}
          existingCredential={selectedCredential}
          isSaving={isSaving}
          onCancel={closeModal}
          onSubmit={saveCredential}
        />
      )}

      <DeleteResourceModal
        isOpen={Boolean(credentialToDelete)}
        onCancel={() => setCredentialToDelete(null)}
        onOk={deleteCredential}
        title={t("models.credentials.deleteDialog.title")}
        message={t("models.credentials.deleteDialog.message")}
        resourceInformationTitle={t("models.credentials.deleteDialog.information")}
        resourceInformation={[
          { label: t("models.credentials.deleteDialog.name"), value: credentialToDelete?.credential_name },
          {
            label: t("models.credentials.deleteDialog.provider"),
            value: credentialToDelete?.credential_info?.custom_llm_provider || "-",
          },
        ]}
        confirmLoading={isDeleting}
        requiredConfirmation={credentialToDelete?.credential_name}
      />
    </section>
  );
}
