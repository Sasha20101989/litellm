"use client";

import { useHashicorpVaultConfig } from "@/app/(dashboard)/hooks/configOverrides/useHashicorpVaultConfig";
import { useUpdateHashicorpVaultConfig } from "@/app/(dashboard)/hooks/configOverrides/useUpdateHashicorpVaultConfig";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import NotificationManager from "@/components/molecules/notifications_manager";
import { Button, Divider, Form, Input, Modal, Space, Typography } from "antd";
import React, { useEffect } from "react";
import { SENSITIVE_FIELDS } from "./constants";
import { useTranslation } from "react-i18next";

interface FieldGroup {
  titleKey: string;
  subtitleKey?: string;
  fields: string[];
}

const FIELD_GROUPS: FieldGroup[] = [
  {
    titleKey: "admin.vault.groups.connection",
    fields: ["vault_addr", "vault_namespace", "vault_mount_name", "vault_path_prefix"],
  },
  {
    titleKey: "admin.vault.groups.token",
    subtitleKey: "admin.vault.groups.tokenDescription",
    fields: ["vault_token"],
  },
  {
    titleKey: "admin.vault.groups.approle",
    subtitleKey: "admin.vault.groups.approleDescription",
    fields: ["approle_role_id", "approle_secret_id", "approle_mount_path"],
  },
  {
    titleKey: "admin.vault.groups.tls",
    subtitleKey: "admin.vault.groups.tlsDescription",
    fields: ["client_cert", "client_key", "vault_cert_role"],
  },
];

interface EditHashicorpVaultModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditHashicorpVaultModal: React.FC<EditHashicorpVaultModalProps> = ({ isVisible, onCancel, onSuccess }) => {
  const { t } = useTranslation("settings");
  const [form] = Form.useForm();
  const { accessToken } = useAuthorized();
  const { data } = useHashicorpVaultConfig();
  const { mutate, isPending } = useUpdateHashicorpVaultConfig(accessToken);

  const schema = data?.field_schema;
  const properties = schema?.properties ?? {};
  const rawValues = data?.values ?? {};
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

  useEffect(() => {
    if (isVisible && data) {
      form.resetFields();
      // Only set non-sensitive fields — sensitive ones show as placeholders
      const formValues: Record<string, any> = {};
      for (const [key, value] of Object.entries(rawValues)) {
        if (!SENSITIVE_FIELDS.has(key)) {
          formValues[key] = value;
        }
      }
      form.setFieldsValue(formValues);
    }
  }, [isVisible, data, form]);

  const handleSubmit = (formValues: Record<string, any>) => {
    const config: Record<string, any> = {};
    for (const [key, value] of Object.entries(formValues)) {
      if (value !== undefined && value !== null && value !== "") {
        // Non-empty value → update
        config[key] = value;
      } else if (!SENSITIVE_FIELDS.has(key)) {
        // Non-sensitive field cleared → send "" to clear it on the backend
        config[key] = "";
      }
      // Sensitive field left blank → omit from payload (keep existing)
    }

    mutate(config, {
      onSuccess: () => {
        NotificationManager.success(t("admin.vault.updated"));
        onSuccess();
      },
      onError: (err) => {
        NotificationManager.fromBackend(err);
      },
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const renderField = (fieldName: string) => {
    const fieldSchema = properties[fieldName];
    if (!fieldSchema) return null;

    const rules =
      fieldName === "vault_addr"
        ? [{ pattern: /^https?:\/\/.+/, message: t("admin.vault.urlProtocol") }]
        : undefined;

    const isSensitive = SENSITIVE_FIELDS.has(fieldName);
    const existingValue = rawValues[fieldName];
    const hasExistingValue = isSensitive && existingValue != null && existingValue !== "";
    const placeholder = hasExistingValue
      ? t("admin.vault.keepExisting", { value: existingValue })
      : fieldLabels[fieldName] ?? fieldName;

    return (
      <Form.Item key={fieldName} name={fieldName} label={fieldLabels[fieldName] ?? fieldName} rules={rules}>
        {isSensitive ? <Input.Password placeholder={placeholder} /> : <Input placeholder={placeholder} />}
      </Form.Item>
    );
  };

  return (
    <Modal
      title={t("admin.vault.editTitle")}
      open={isVisible}
      width={700}
      footer={
        <Space>
          <Button onClick={handleCancel} disabled={isPending}>
            {t("admin.vault.cancel")}
          </Button>
          <Button type="primary" loading={isPending} onClick={() => form.submit()}>
            {isPending ? t("admin.vault.saving") : t("admin.vault.save")}
          </Button>
        </Space>
      }
      onCancel={handleCancel}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {FIELD_GROUPS.map((group, index) => (
          <div key={group.titleKey}>
            {index > 0 && <Divider />}
            <Typography.Title level={5} style={{ marginBottom: 4 }}>
              {t(group.titleKey)}
            </Typography.Title>
            {group.subtitleKey && (
              <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
                {t(group.subtitleKey)}
              </Typography.Paragraph>
            )}
            {group.fields.map(renderField)}
          </div>
        ))}
      </Form>
    </Modal>
  );
};

export default EditHashicorpVaultModal;
