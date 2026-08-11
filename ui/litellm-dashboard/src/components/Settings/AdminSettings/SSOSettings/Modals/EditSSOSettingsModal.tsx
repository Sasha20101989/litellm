"use client";

import { Button, Form, Modal, Space } from "antd";
import React, { useEffect } from "react";
import BaseSSOSettingsForm from "./BaseSSOSettingsForm";
import NotificationsManager from "@/components/molecules/notifications_manager";
import { parseErrorMessage } from "@/components/shared/errorUtils";
import { detectSSOProvider, processSSOSettingsPayload } from "../utils";
import { useSSOSettings } from "@/app/(dashboard)/hooks/sso/useSSOSettings";
import { useEditSSOSettings } from "@/app/(dashboard)/hooks/sso/useEditSSOSettings";
import { useTranslation } from "react-i18next";

interface EditSSOSettingsModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditSSOSettingsModal: React.FC<EditSSOSettingsModalProps> = ({ isVisible, onCancel, onSuccess }) => {
  const { t } = useTranslation("settings");
  const [form] = Form.useForm();

  // Use react-query hooks for SSO settings
  const ssoSettings = useSSOSettings();
  const { mutateAsync, isPending } = useEditSSOSettings();
  useEffect(() => {
    if (isVisible && ssoSettings.data && ssoSettings.data.values) {
      const ssoData = ssoSettings.data;

      // Determine which SSO provider is configured
      const selectedProvider = detectSSOProvider(ssoData.values);

      // Extract role mappings if they exist
      let roleMappingFields = {};
      if (ssoData.values.role_mappings) {
        const roleMappings = ssoData.values.role_mappings;

        // Helper function to join arrays into comma-separated strings
        const joinTeams = (teams: string[] | undefined): string => {
          if (!teams || teams.length === 0) return "";
          return teams.join(", ");
        };

        roleMappingFields = {
          use_role_mappings: true,
          group_claim: roleMappings.group_claim,
          default_role: roleMappings.default_role || "internal_user",
          proxy_admin_teams: joinTeams(roleMappings.roles?.proxy_admin),
          admin_viewer_teams: joinTeams(roleMappings.roles?.proxy_admin_viewer),
          internal_user_teams: joinTeams(roleMappings.roles?.internal_user),
          internal_viewer_teams: joinTeams(roleMappings.roles?.internal_user_viewer),
        };
      }

      // Extract team mappings if they exist
      let teamMappingFields = {};
      if (ssoData.values.team_mappings) {
        const teamMappings = ssoData.values.team_mappings;
        teamMappingFields = {
          use_team_mappings: true,
          team_ids_jwt_field: teamMappings.team_ids_jwt_field,
        };
      }

      // Set form values with existing data (excluding UI access control fields)
      const formValues = {
        sso_provider: selectedProvider,
        ...ssoData.values,
        ...roleMappingFields,
        ...teamMappingFields,
        ...(ssoData.values.saml_allow_unsolicited != null
          ? { saml_allow_unsolicited: ssoData.values.saml_allow_unsolicited === "true" }
          : {}),
      };

      // Clear form first, then set values with a small delay to ensure proper initialization
      form.resetFields();
      setTimeout(() => {
        form.setFieldsValue(formValues);
      }, 100);
    }
  }, [isVisible, ssoSettings.data, form]);

  // Enhanced form submission handler
  const handleFormSubmit = async (formValues: Record<string, any>) => {
    try {
      const payload = processSSOSettingsPayload(formValues);

      await mutateAsync(payload, {
        onSuccess: () => {
          NotificationsManager.success(t("admin.sso.updated"));
          onSuccess();
        },
        onError: (error) => {
          NotificationsManager.fromBackend(t("admin.sso.savedFailed", { error: parseErrorMessage(error) }));
        },
      });
    } catch (error) {
      // Handle processing errors gracefully
      NotificationsManager.fromBackend(t("admin.sso.processFailed", { error: parseErrorMessage(error) }));
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t("admin.sso.edit")}
      open={isVisible}
      width={800}
      footer={
        <Space>
          <Button onClick={handleCancel} disabled={isPending}>
            {t("admin.sso.cancel")}
          </Button>
          <Button loading={isPending} onClick={() => form.submit()}>
            {isPending ? t("admin.sso.saving") : t("admin.sso.save")}
          </Button>
        </Space>
      }
      onCancel={handleCancel}
    >
      <BaseSSOSettingsForm form={form} onFormSubmit={handleFormSubmit} />
    </Modal>
  );
};

export default EditSSOSettingsModal;
