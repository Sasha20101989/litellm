"use client";

import { useState } from "react";
import { useHashicorpVaultConfig } from "@/app/(dashboard)/hooks/configOverrides/useHashicorpVaultConfig";
import { useDeleteHashicorpVaultConfig } from "@/app/(dashboard)/hooks/configOverrides/useDeleteHashicorpVaultConfig";
import { useUpdateHashicorpVaultConfig } from "@/app/(dashboard)/hooks/configOverrides/useUpdateHashicorpVaultConfig";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import DeleteResourceModal from "@/components/common_components/DeleteResourceModal";
import NotificationManager from "@/components/molecules/notifications_manager";
import { testHashicorpVaultConnection } from "@/app/(dashboard)/hooks/configOverrides/hashicorpVaultApi";
import { Alert, Button, Card, Descriptions, Flex, Skeleton, Space, Typography } from "antd";
import { Edit, KeyRound, PlugZap, Trash2 } from "lucide-react";
import { SENSITIVE_FIELDS } from "./constants";
import EditHashicorpVaultModal from "./EditHashicorpVaultModal";
import HashicorpVaultEmptyPlaceholder from "./HashicorpVaultEmptyPlaceholder";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

function detectAuthMethod(values: Record<string, any>): string {
  if (values.approle_role_id || values.approle_secret_id) return "approle";
  if (values.client_cert && values.client_key) return "certificate";
  if (values.vault_token) return "token";
  return "none";
}

const descriptionsConfig = {
  column: { xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 },
};

export default function HashicorpVault() {
  const { t } = useTranslation("settings");
  const { accessToken } = useAuthorized();
  const { data, isLoading, isError, error } = useHashicorpVaultConfig();
  const { mutate: deleteConfig, isPending: isDeleting } = useDeleteHashicorpVaultConfig(accessToken);
  const { mutate: updateConfig, isPending: isClearingField } = useUpdateHashicorpVaultConfig(accessToken);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clearingField, setClearingField] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const rawValues = data?.values ?? {};
  const isConfigured = Boolean(rawValues.vault_addr);
  const fieldLabels: Record<string, string> = {
    vault_addr: t("admin.vault.fields.vault_addr"),
    vault_namespace: t("admin.vault.fields.vault_namespace"),
    vault_mount_name: t("admin.vault.fields.vault_mount_name"),
    vault_path_prefix: t("admin.vault.fields.vault_path_prefix"),
    vault_token: t("admin.vault.fields.vault_token"),
    approle_role_id: t("admin.vault.fields.approle_role_id"),
    approle_secret_id: t("admin.vault.fields.approle_secret_id"),
    approle_mount_path: t("admin.vault.fields.approle_mount_path"),
    client_cert: t("admin.vault.fields.client_cert"),
    client_key: t("admin.vault.fields.client_key"),
    vault_cert_role: t("admin.vault.fields.vault_cert_role"),
  };

  const handleTestConnection = async () => {
    if (!accessToken) return;
    setIsTesting(true);
    try {
      const result = await testHashicorpVaultConnection(accessToken);
      NotificationManager.success(result.message || t("admin.vault.connectionSuccess"));
    } catch (err) {
      NotificationManager.fromBackend(err);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = () => {
    deleteConfig(undefined, {
      onSuccess: () => {
        NotificationManager.success(t("admin.vault.deleted"));
        setIsDeleteModalOpen(false);
      },
      onError: (err) => {
        NotificationManager.fromBackend(err);
      },
    });
  };

  const handleClearField = () => {
    if (!clearingField) return;
    updateConfig(
      { [clearingField]: "" },
      {
        onSuccess: () => {
          NotificationManager.success(
            t("admin.vault.fieldCleared", { field: fieldLabels[clearingField] ?? clearingField }),
          );
          setClearingField(null);
        },
        onError: (err) => {
          NotificationManager.fromBackend(err);
        },
      },
    );
  };

  const renderValue = (key: string) => {
    const value = rawValues[key];
    if (!value) {
      return <span className="text-gray-400 italic">{t("admin.vault.notConfigured")}</span>;
    }
    if (SENSITIVE_FIELDS.has(key)) {
      return (
        <Flex justify="space-between" align="center">
          <Text className="font-mono text-gray-600">{value}</Text>
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setClearingField(key)}
          />
        </Flex>
      );
    }
    return <Text className="font-mono text-gray-600">{value}</Text>;
  };

  const renderSettings = () => {
    // Only show fields that have values, plus auth method
    const fieldsToShow = Object.entries(rawValues).filter(([_, value]) => value != null && value !== "");

    if (fieldsToShow.length === 0) return null;

    return (
      <Descriptions bordered {...descriptionsConfig}>
        <Descriptions.Item label={t("admin.vault.authMethod")}>
          <Text>{t(`admin.vault.authMethods.${detectAuthMethod(rawValues)}`)}</Text>
        </Descriptions.Item>
        {fieldsToShow.map(([key]) => (
          <Descriptions.Item key={key} label={fieldLabels[key] ?? key}>
            {renderValue(key)}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  return (
    <>
      {isLoading ? (
        <Card>
          <Skeleton active />
        </Card>
      ) : isError ? (
        <Card>
          <Alert
            type="error"
            message={t("admin.vault.loadFailed")}
            description={error instanceof Error ? error.message : undefined}
          />
        </Card>
      ) : (
        <Card>
          <Space direction="vertical" size="large" className="w-full">
            {/* Header */}
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={12}>
                <KeyRound className="w-6 h-6 text-gray-400" />
                <div>
                  <Title level={3} style={{ marginBottom: 0 }}>
                    {t("admin.vault.title")}
                  </Title>
                  <Text type="secondary">{t("admin.vault.description")}</Text>
                </div>
              </Flex>

              <Space>
                {isConfigured && (
                  <>
                    <Button icon={<PlugZap className="w-4 h-4" />} loading={isTesting} onClick={handleTestConnection}>
                      {t("admin.vault.test")}
                    </Button>
                    <Button icon={<Edit className="w-4 h-4" />} onClick={() => setIsEditModalVisible(true)}>
                      {t("admin.vault.edit")}
                    </Button>
                    <Button danger icon={<Trash2 className="w-4 h-4" />} onClick={() => setIsDeleteModalOpen(true)}>
                      {t("admin.vault.delete")}
                    </Button>
                  </>
                )}
              </Space>
            </Flex>

            {isConfigured && (
              <Alert
                type="info"
                showIcon
                message={t("admin.vault.secretField")}
                description={
                  <>
                    <Text code>vault kv put secret/SECRET_NAME key=secret_value</Text>
                    <br />
                    <Typography.Link
                      href="https://docs.litellm.ai/docs/secret_managers/hashicorp_vault"
                      target="_blank"
                    >
                      {t("admin.vault.docs")}
                    </Typography.Link>
                  </>
                }
              />
            )}

            {isConfigured ? (
              renderSettings()
            ) : (
              <HashicorpVaultEmptyPlaceholder onAdd={() => setIsEditModalVisible(true)} />
            )}
          </Space>
        </Card>
      )}

      <EditHashicorpVaultModal
        isVisible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onSuccess={() => setIsEditModalVisible(false)}
      />

      <DeleteResourceModal
        isOpen={isDeleteModalOpen}
        title={t("admin.vault.deleteTitle")}
        message={t("admin.vault.deleteMessage")}
        resourceInformationTitle={t("admin.vault.configuration")}
        resourceInformation={[{ label: t("admin.vault.address"), value: rawValues.vault_addr }]}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={handleDelete}
        confirmLoading={isDeleting}
      />

      <DeleteResourceModal
        isOpen={clearingField !== null}
        title={t("admin.vault.clearTitle", {
          field: clearingField ? fieldLabels[clearingField] ?? clearingField : "",
        })}
        message={t("admin.vault.clearMessage")}
        resourceInformationTitle={t("admin.vault.field")}
        resourceInformation={[
          { label: t("admin.vault.field"), value: clearingField ? fieldLabels[clearingField] ?? clearingField : "" },
        ]}
        onCancel={() => setClearingField(null)}
        onOk={handleClearField}
        confirmLoading={isClearingField}
      />
    </>
  );
}
