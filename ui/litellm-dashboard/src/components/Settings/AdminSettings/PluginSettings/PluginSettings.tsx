"use client";

import { useState, useEffect } from "react";
import { Button, Card, Form, Input, Modal, Space, Table, Typography } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { getConfigFieldSetting, updateConfigFieldSetting } from "@/components/networking";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useTranslation } from "react-i18next";

const { Title, Text, Paragraph } = Typography;

interface Plugin {
  name: string;
  display_name: string;
  url: string;
  plugin_key?: string;
}

export default function PluginSettings() {
  const { t } = useTranslation("settings");
  const { accessToken } = useAuthorized();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = Form.useForm<Plugin>();

  useEffect(() => {
    if (!accessToken) return;
    getConfigFieldSetting(accessToken, "plugins")
      .then((data) => {
        const val = data?.field_value;
        setPlugins(Array.isArray(val) ? val : []);
      })
      .catch(() => setPlugins([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const save = async (updated: Plugin[]) => {
    if (!accessToken) return;
    setSaving(true);
    try {
      await updateConfigFieldSetting(accessToken, "plugins", updated);
      setPlugins(updated);
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setEditingIndex(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (idx: number) => {
    setEditingIndex(idx);
    // plugin_key arrives redacted ("***"); start it blank so an untouched save
    // keeps the stored credential instead of overwriting it with the placeholder.
    form.setFieldsValue({ ...plugins[idx], plugin_key: "" });
    setModalOpen(true);
  };

  const handleDelete = (idx: number) => {
    const updated = plugins.filter((_, i) => i !== idx);
    save(updated);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const updated =
      editingIndex !== null ? plugins.map((p, i) => (i === editingIndex ? values : p)) : [...plugins, values];
    await save(updated);
    setModalOpen(false);
  };

  const columns = [
    {
      title: t("admin.plugins.name"),
      dataIndex: "name",
      key: "name",
      render: (v: string) => <Text code>{v}</Text>,
    },
    { title: t("admin.plugins.displayName"), dataIndex: "display_name", key: "display_name" },
    {
      title: t("admin.plugins.url"),
      dataIndex: "url",
      key: "url",
      render: (v: string) => (
        <a href={v} target="_blank" rel="noopener noreferrer">
          {v}
        </a>
      ),
    },
    {
      title: t("admin.plugins.key"),
      dataIndex: "plugin_key",
      key: "plugin_key",
      render: (v?: string) => (v ? <Text code>{"•".repeat(8)}</Text> : <Text type="secondary">—</Text>),
    },
    {
      title: t("admin.plugins.actions"),
      key: "actions",
      render: (_: unknown, __: Plugin, idx: number) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(idx)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(idx)} />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>{t("admin.plugins.title")}</Title>
      <Paragraph>{t("admin.plugins.description")}</Paragraph>
      <Paragraph type="secondary" style={{ fontSize: 12 }}>
        {t("admin.plugins.manifest")}
      </Paragraph>

      <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ marginBottom: 16 }}>
        {t("admin.plugins.add")}
      </Button>

      <Table dataSource={plugins} columns={columns} rowKey="name" loading={loading} pagination={false} size="small" />

      <Modal
        title={editingIndex !== null ? t("admin.plugins.edit") : t("admin.plugins.add")}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText={t("admin.plugins.save")}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label={t("admin.plugins.identifier")}
            rules={[{ required: true, message: t("admin.plugins.required") }]}
            extra={t("admin.plugins.identifierHelp")}
          >
            <Input placeholder="litellm-platform-plugin" />
          </Form.Item>
          <Form.Item
            name="display_name"
            label={t("admin.plugins.displayName")}
            rules={[{ required: true, message: t("admin.plugins.required") }]}
          >
            <Input placeholder={t("admin.plugins.displayPlaceholder")} />
          </Form.Item>
          <Form.Item
            name="url"
            label={t("admin.plugins.url")}
            rules={[
              { required: true, message: t("admin.plugins.required") },
              { type: "url", message: t("admin.plugins.urlInvalid") },
            ]}
            extra={t("admin.plugins.urlHelp")}
          >
            <Input placeholder="https://your-plugin.example.com" />
          </Form.Item>
          <Form.Item name="plugin_key" label={t("admin.plugins.key")} extra={t("admin.plugins.keyHelp")}>
            <Input.Password
              placeholder={editingIndex !== null ? t("admin.plugins.keepKey") : t("admin.plugins.optionalKey")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
