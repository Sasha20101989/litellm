import { Form, Modal, Input } from "antd";
import MessageManager from "@/components/molecules/message_manager";
import { useEffect } from "react";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useCloudZeroCreate } from "@/app/(dashboard)/hooks/cloudzero/useCloudZeroCreate";
import { useTranslation } from "react-i18next";

interface CloudZeroCreationModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export default function CloudZeroCreationModal({ open, onOk, onCancel }: CloudZeroCreationModalProps) {
  const { t } = useTranslation("settings");
  const { accessToken } = useAuthorized();
  const [form] = Form.useForm();
  const createMutation = useCloudZeroCreate(accessToken || "");

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate(
        {
          connection_id: values.connection_id,
          timezone: values.timezone || "UTC",
          ...(values.api_key && { api_key: values.api_key }),
        },
        {
          onSuccess: () => {
            MessageManager.success(t("logging.cloudZero.created"));
            form.resetFields();
            onOk();
          },
          onError: (error: any) => {
            if (error?.errorFields) {
              return;
            }
            MessageManager.error(error?.message || t("logging.cloudZero.createFailed"));
          },
        },
      );
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      MessageManager.error(error?.message || t("logging.cloudZero.createFailed"));
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t("logging.cloudZero.createTitle")}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={createMutation.isPending}
      okText={createMutation.isPending ? t("logging.cloudZero.creating") : t("logging.cloudZero.create")}
      cancelText={t("logging.cloudZero.cancel")}
      okButtonProps={{
        disabled: createMutation.isPending,
      }}
      cancelButtonProps={{
        disabled: createMutation.isPending,
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={t("logging.cloudZero.apiKey")}
          name="api_key"
          rules={[{ required: true, message: t("logging.cloudZero.apiKeyRequired") }]}
        >
          <Input.Password placeholder={t("logging.cloudZero.apiKeyPlaceholder")} />
        </Form.Item>
        <Form.Item
          label={t("logging.cloudZero.connectionId")}
          name="connection_id"
          rules={[{ required: true, message: t("logging.cloudZero.connectionRequired") }]}
        >
          <Input placeholder={t("logging.cloudZero.connectionPlaceholder")} />
        </Form.Item>
        <Form.Item
          label={t("logging.cloudZero.timezone")}
          name="timezone"
          tooltip={t("logging.cloudZero.timezoneHelp")}
        >
          <Input placeholder="UTC" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
