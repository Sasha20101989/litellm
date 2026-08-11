"use client";

import { useUISettings } from "@/app/(dashboard)/hooks/uiSettings/useUISettings";
import { useUpdateUISettings } from "@/app/(dashboard)/hooks/uiSettings/useUpdateUISettings";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import NotificationManager from "@/components/molecules/notifications_manager";
import PageVisibilitySettings from "./PageVisibilitySettings";
import { Alert, Card, Divider, Skeleton, Space, Switch, Typography } from "antd";
import { useTranslation } from "react-i18next";

export default function UISettings() {
  const { t } = useTranslation("settings");
  const { accessToken } = useAuthorized();
  const { data, isLoading, isError, error } = useUISettings();
  const { mutate: updateSettings, isPending: isUpdating, error: updateError } = useUpdateUISettings(accessToken);

  const schema = data?.field_schema;
  const enableProjectsUIProperty = schema?.properties?.enable_projects_ui;
  const values = data?.values ?? {};
  const isDisabledForInternalUsers = Boolean(values.disable_model_add_for_internal_users);
  const isDisabledTeamAdminDeleteTeamUser = Boolean(values.disable_team_admin_delete_team_user);
  const isAgentsDisabled = Boolean(values.disable_agents_for_internal_users);
  const isVectorStoresDisabled = Boolean(values.disable_vector_stores_for_internal_users);

  const handleToggle = (checked: boolean) => {
    updateSettings(
      { disable_model_add_for_internal_users: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleTeamAdminDelete = (checked: boolean) => {
    updateSettings(
      { disable_team_admin_delete_team_user: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleUpdatePageVisibility = (settings: { enabled_ui_pages_internal_users: string[] | null }) => {
    updateSettings(settings, {
      onSuccess: () => {
        NotificationManager.success(t("admin.ui.pagesUpdated"));
      },
      onError: (error) => {
        NotificationManager.fromBackend(error);
      },
    });
  };

  const handleToggleForwardClientHeaders = (checked: boolean) => {
    updateSettings(
      { forward_client_headers_to_llm_api: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleForwardLLMProviderAuthHeaders = (checked: boolean) => {
    updateSettings(
      { forward_llm_provider_auth_headers: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleEnableProjectsUI = (checked: boolean) => {
    updateSettings(
      { enable_projects_ui: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updatedReload"));
          setTimeout(() => window.location.reload(), 1000);
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleEnableChatUI = (checked: boolean) => {
    updateSettings(
      { enable_chat_ui: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updatedReload"));
          setTimeout(() => window.location.reload(), 1000);
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleRequireAuthForPublicAIHub = (checked: boolean) => {
    updateSettings(
      { require_auth_for_public_ai_hub: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleDisableAgents = (checked: boolean) => {
    updateSettings(
      { disable_agents_for_internal_users: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleAllowAgentsTeamAdmins = (checked: boolean) => {
    updateSettings(
      { allow_agents_for_team_admins: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleDisableVectorStores = (checked: boolean) => {
    updateSettings(
      { disable_vector_stores_for_internal_users: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleAllowVectorStoresTeamAdmins = (checked: boolean) => {
    updateSettings(
      { allow_vector_stores_for_team_admins: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleScopeUserSearch = (checked: boolean) => {
    updateSettings(
      { scope_user_search_to_org: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  const handleToggleDisableCustomApiKeys = (checked: boolean) => {
    updateSettings(
      { disable_custom_api_keys: checked },
      {
        onSuccess: () => {
          NotificationManager.success(t("admin.ui.updated"));
        },
        onError: (error) => {
          NotificationManager.fromBackend(error);
        },
      },
    );
  };

  return (
    <Card title={t("admin.ui.title")}>
      {isLoading ? (
        <Skeleton active />
      ) : isError ? (
        <Alert
          type="error"
          message={t("admin.ui.loadFailed")}
          description={error instanceof Error ? error.message : undefined}
        />
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {updateError && (
            <Alert
              type="error"
              message={t("admin.ui.updateFailed")}
              description={updateError instanceof Error ? updateError.message : undefined}
            />
          )}

          <Space align="start" size="middle">
            <Switch
              checked={isDisabledForInternalUsers}
              disabled={isUpdating}
              loading={isUpdating}
              onChange={handleToggle}
              aria-label={t("admin.ui.disableModelAdd")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{t("admin.ui.disableModelAdd")}</Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.disableModelAddDescription")}</Typography.Text>
            </Space>
          </Space>

          <Space align="start" size="middle">
            <Switch
              checked={isDisabledTeamAdminDeleteTeamUser}
              disabled={isUpdating}
              loading={isUpdating}
              onChange={handleToggleTeamAdminDelete}
              aria-label={t("admin.ui.disableTeamAdminDelete")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{t("admin.ui.disableTeamAdminDelete")}</Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.disableTeamAdminDeleteDescription")}</Typography.Text>
            </Space>
          </Space>

          <Space align="start" size="middle">
            <Switch
              checked={values.require_auth_for_public_ai_hub}
              disabled={isUpdating}
              loading={isUpdating}
              onChange={handleToggleRequireAuthForPublicAIHub}
              aria-label={t("admin.ui.requireHubAuth")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{t("admin.ui.requireHubAuth")}</Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.requireHubAuthDescription")}</Typography.Text>
            </Space>
          </Space>

          <Space align="start" size="middle">
            <Switch
              checked={Boolean(values.forward_client_headers_to_llm_api)}
              disabled={isUpdating}
              loading={isUpdating}
              onChange={handleToggleForwardClientHeaders}
              aria-label={t("admin.ui.forwardClientHeaders")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{t("admin.ui.forwardClientHeaders")}</Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.forwardClientHeadersDescription")}</Typography.Text>
            </Space>
          </Space>

          <Space align="start" size="middle">
            <Switch
              checked={Boolean(values.forward_llm_provider_auth_headers)}
              disabled={isUpdating}
              loading={isUpdating}
              onChange={handleToggleForwardLLMProviderAuthHeaders}
              aria-label={t("admin.ui.forwardProviderHeaders")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{t("admin.ui.forwardProviderHeaders")}</Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.forwardProviderHeadersDescription")}</Typography.Text>
            </Space>
          </Space>

          {enableProjectsUIProperty && (
            <Space align="start" size="middle">
              <Switch
                checked={Boolean(values.enable_projects_ui)}
                disabled={isUpdating}
                loading={isUpdating}
                onChange={handleToggleEnableProjectsUI}
                aria-label={t("admin.ui.enableProjects")}
              />
              <Space direction="vertical" size={4}>
                <Typography.Text strong>{t("admin.ui.enableProjects")}</Typography.Text>
                <Typography.Text type="secondary">{t("admin.ui.enableProjectsDescription")}</Typography.Text>
              </Space>
            </Space>
          )}

          <Space align="start" size="middle">
            <Switch
              checked={Boolean(values.enable_chat_ui)}
              disabled={isUpdating}
              loading={isUpdating}
              onChange={handleToggleEnableChatUI}
              aria-label={t("admin.ui.enableChat")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{t("admin.ui.enableChat")}</Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.enableChatDescription")}</Typography.Text>
            </Space>
          </Space>

          <Divider />

          {/* Agents access control */}
          <Space align="start" size="middle">
            <Switch
              checked={isAgentsDisabled}
              disabled={isUpdating}
              loading={isUpdating}
              onChange={handleToggleDisableAgents}
              aria-label={t("admin.ui.disableAgents")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{t("admin.ui.disableAgents")}</Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.disableAgentsDescription")}</Typography.Text>
            </Space>
          </Space>

          <Space align="start" size="middle" style={{ marginLeft: 32 }}>
            <Switch
              checked={Boolean(values.allow_agents_for_team_admins)}
              disabled={isUpdating || !isAgentsDisabled}
              loading={isUpdating}
              onChange={handleToggleAllowAgentsTeamAdmins}
              aria-label={t("admin.ui.allowAgentsAdmins")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong type={!isAgentsDisabled ? "secondary" : undefined}>
                {t("admin.ui.allowAgentsAdmins")}
              </Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.allowAgentsAdminsDescription")}</Typography.Text>
            </Space>
          </Space>

          <Divider />

          {/* Vector Stores access control */}
          <Space align="start" size="middle">
            <Switch
              checked={isVectorStoresDisabled}
              disabled={isUpdating}
              loading={isUpdating}
              onChange={handleToggleDisableVectorStores}
              aria-label={t("admin.ui.disableVectorStores")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{t("admin.ui.disableVectorStores")}</Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.disableVectorStoresDescription")}</Typography.Text>
            </Space>
          </Space>

          <Space align="start" size="middle" style={{ marginLeft: 32 }}>
            <Switch
              checked={Boolean(values.allow_vector_stores_for_team_admins)}
              disabled={isUpdating || !isVectorStoresDisabled}
              loading={isUpdating}
              onChange={handleToggleAllowVectorStoresTeamAdmins}
              aria-label={t("admin.ui.allowVectorStoresAdmins")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong type={!isVectorStoresDisabled ? "secondary" : undefined}>
                {t("admin.ui.allowVectorStoresAdmins")}
              </Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.allowVectorStoresAdminsDescription")}</Typography.Text>
            </Space>
          </Space>

          <Divider />

          {/* Scope user search to organization */}
          <Space align="start" size="middle">
            <Switch
              checked={Boolean(values.scope_user_search_to_org)}
              disabled={isUpdating}
              loading={isUpdating}
              onChange={handleToggleScopeUserSearch}
              aria-label={t("admin.ui.scopeUserSearch")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{t("admin.ui.scopeUserSearch")}</Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.scopeUserSearchDescription")}</Typography.Text>
            </Space>
          </Space>

          <Divider />

          {/* Disable custom Virtual key values */}
          <Space align="start" size="middle">
            <Switch
              checked={Boolean(values.disable_custom_api_keys)}
              disabled={isUpdating}
              loading={isUpdating}
              onChange={handleToggleDisableCustomApiKeys}
              aria-label={t("admin.ui.disableCustomKeys")}
            />
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{t("admin.ui.disableCustomKeys")}</Typography.Text>
              <Typography.Text type="secondary">{t("admin.ui.disableCustomKeysDescription")}</Typography.Text>
            </Space>
          </Space>

          <Divider />

          {/* Page Visibility for Internal Users */}
          <PageVisibilitySettings
            enabledPagesInternalUsers={values.enabled_ui_pages_internal_users}
            isUpdating={isUpdating}
            onUpdate={handleUpdatePageVisibility}
          />
        </Space>
      )}
    </Card>
  );
}
