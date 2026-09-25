"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useCredentialsWorkspace } from "@/features/models-and-endpoints/useCredentialsWorkspace";
import { CredentialItem } from "@/components/networking";
import { Button } from "@/components/ui/button";

import DeleteResourceModal from "../common_components/DeleteResourceModal";
import { toast } from "@/lib/toast";
import CredentialModal from "./CredentialModal";
import CredentialsTable from "./CredentialsTable";

export default function CredentialsPanel() {
  const workspace = useCredentialsWorkspace();
  const { credentials: credentialList, isLoading, canModifyCredentials } = workspace;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<CredentialItem | null>(null);
  const [credentialToDelete, setCredentialToDelete] = useState<CredentialItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCredentialDeleting, setIsCredentialDeleting] = useState(false);

  const handleUpdateCredential = async (values: Record<string, unknown>) => {
    try {
      if (!(await workspace.updateCredential(values))) return;
      toast.success("Credential updated successfully");
      setIsUpdateModalOpen(false);
    } catch (error) {
      toast.error("Failed to update credential");
    }
  };

  const handleAddCredential = async (values: Record<string, unknown>) => {
    try {
      if (!(await workspace.createCredential(values))) return;
      toast.success("Credential added successfully");
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error("Failed to add credential");
    }
  };

  const handleDeleteCredential = async () => {
    if (!credentialToDelete) {
      return;
    }
    setIsCredentialDeleting(true);
    try {
      if (!(await workspace.deleteCredential(credentialToDelete.credential_name))) return;
      toast.success("Credential deleted successfully");
    } catch (error) {
      toast.error("Failed to delete credential");
    } finally {
      setCredentialToDelete(null);
      setIsDeleteModalOpen(false);
      setIsCredentialDeleting(false);
    }
  };

  const openEditModal = (credential: CredentialItem) => {
    setSelectedCredential(credential);
    setIsUpdateModalOpen(true);
  };

  const openDeleteModal = (credential: CredentialItem) => {
    setCredentialToDelete(credential);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCredentialToDelete(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="mx-auto flex w-full flex-auto flex-col gap-4 overflow-y-auto p-2">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Configured credentials for different AI providers. Add and manage your API credentials.
        </p>
        {canModifyCredentials && (
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="size-4" />
            Add Credential
          </Button>
        )}
      </div>

      <CredentialsTable
        credentials={credentialList}
        canModifyCredentials={canModifyCredentials}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        isLoading={isLoading}
      />

      {isAddModalOpen && (
        <CredentialModal
          mode="add"
          onSubmit={handleAddCredential}
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
        />
      )}
      {isUpdateModalOpen && (
        <CredentialModal
          mode="edit"
          open={isUpdateModalOpen}
          existingCredential={selectedCredential}
          onSubmit={handleUpdateCredential}
          onCancel={() => setIsUpdateModalOpen(false)}
        />
      )}

      <DeleteResourceModal
        isOpen={isDeleteModalOpen}
        onCancel={closeDeleteModal}
        onOk={handleDeleteCredential}
        title="Delete Credential?"
        message="Are you sure you want to delete this credential? This action cannot be undone and may break existing integrations."
        resourceInformationTitle="Credential Information"
        resourceInformation={[
          { label: "Credential Name", value: credentialToDelete?.credential_name },
          { label: "Provider", value: credentialToDelete?.credential_info?.custom_llm_provider || "-" },
        ]}
        confirmLoading={isCredentialDeleting}
        requiredConfirmation={credentialToDelete?.credential_name}
      />
    </div>
  );
}
