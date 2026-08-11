"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Typography } from "antd";
import type { MemoryRow } from "@/components/networking";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

interface MemoryEditModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialRow?: MemoryRow;
  onClose: () => void;
  onSave: (key: string, value: string, metadataText: string, isCreate: boolean) => Promise<boolean>;
}

export const MemoryEditModal: React.FC<MemoryEditModalProps> = ({ open, mode, initialRow, onClose, onSave }) => {
  const { t } = useTranslation("gateway");
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialRow) {
      form.setFieldsValue({
        key: initialRow.key,
        value: initialRow.value,
        metadata: initialRow.metadata != null ? JSON.stringify(initialRow.metadata, null, 2) : "",
      });
    } else {
      form.resetFields();
    }
  }, [open, mode, initialRow, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    const ok = await onSave(values.key.trim(), values.value ?? "", values.metadata ?? "", mode === "create");
    setSubmitting(false);
    if (ok) {
      form.resetFields();
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      title={
        mode === "create" ? t("memory.form.createTitle") : t("memory.form.editTitle", { key: initialRow?.key ?? "" })
      }
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleOk}
      okText={mode === "create" ? t("memory.form.create") : t("memory.form.save")}
      confirmLoading={submitting}
      width={640}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={t("memory.form.key")}
          name="key"
          rules={[{ required: true, message: t("memory.form.keyRequired") }]}
          tooltip={t("memory.form.keyTooltip")}
        >
          <Input placeholder={t("memory.form.keyPlaceholder")} disabled={mode === "edit"} />
        </Form.Item>
        <Form.Item
          label={t("memory.form.value")}
          name="value"
          rules={[{ required: true, message: t("memory.form.valueRequired") }]}
          tooltip={t("memory.form.valueTooltip")}
        >
          <Input.TextArea rows={8} placeholder={t("memory.form.valuePlaceholder")} />
        </Form.Item>
        <Form.Item
          label={
            <span>
              {t("memory.form.metadata")} <Text type="secondary">{t("memory.form.optionalJson")}</Text>
            </span>
          }
          name="metadata"
          tooltip={t("memory.form.metadataTooltip")}
        >
          <Input.TextArea
            rows={4}
            placeholder='{"tags": ["example"]}'
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MemoryEditModal;
