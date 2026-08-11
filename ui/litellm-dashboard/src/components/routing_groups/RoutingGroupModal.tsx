"use client";

import React, { useMemo } from "react";
import { Form, Input, Modal, Select, Space, Typography } from "antd";
import type { RoutingGroup, RoutingStrategy } from "./types";
import { useTranslation } from "react-i18next";

const { Text, Paragraph } = Typography;

interface RoutingGroupModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialValue: RoutingGroup | null;
  availableStrategies: string[];
  strategyDescriptions: Record<string, string>;
  modelOptions: string[];
  existingGroupNames: string[];
  onClose: () => void;
  onSubmit: (group: RoutingGroup) => Promise<void> | void;
  saving?: boolean;
}

interface FormValues {
  group_name: string;
  models: string[];
  routing_strategy: RoutingStrategy | string;
  routing_strategy_args?: string;
}

const STRATEGIES_WITH_ARGS = new Set<string>(["latency-based-routing", "usage-based-routing"]);

const GROUP_NAME_PATTERN = /^[A-Za-z0-9._-]+$/;
const GROUP_NAME_MAX_LENGTH = 64;

const RoutingGroupModal: React.FC<RoutingGroupModalProps> = ({
  open,
  mode,
  initialValue,
  availableStrategies,
  strategyDescriptions,
  modelOptions,
  existingGroupNames,
  onClose,
  onSubmit,
  saving,
}) => {
  const { t } = useTranslation("settings");
  const [form] = Form.useForm<FormValues>();
  const selectedStrategy = Form.useWatch("routing_strategy", form);

  const initialValues: FormValues = {
    group_name: initialValue?.group_name ?? "",
    models: initialValue?.models ?? [],
    routing_strategy: initialValue?.routing_strategy ?? availableStrategies[0] ?? "simple-shuffle",
    routing_strategy_args: initialValue?.routing_strategy_args
      ? JSON.stringify(initialValue.routing_strategy_args, null, 2)
      : "",
  };

  const reservedNames = useMemo(() => {
    const others = existingGroupNames.filter((n) => n !== initialValue?.group_name);
    return new Set(others.map((n) => n.toLowerCase()));
  }, [existingGroupNames, initialValue]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const strategySupportsArgs = STRATEGIES_WITH_ARGS.has(String(values.routing_strategy));
    let parsedArgs: Record<string, unknown> | null = null;
    if (strategySupportsArgs && values.routing_strategy_args && values.routing_strategy_args.trim()) {
      try {
        parsedArgs = JSON.parse(values.routing_strategy_args);
      } catch {
        form.setFields([
          {
            name: "routing_strategy_args",
            errors: [t("router.groups.validJson")],
          },
        ]);
        return;
      }
    }

    await onSubmit({
      group_name: values.group_name.trim(),
      models: values.models,
      routing_strategy: values.routing_strategy,
      routing_strategy_args: parsedArgs,
    });
  };

  return (
    <Modal
      title={
        mode === "create"
          ? t("router.groups.createTitle")
          : t("router.groups.editTitle", { name: initialValue?.group_name ?? "" })
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={mode === "create" ? t("router.groups.create") : t("router.groups.save")}
      cancelText={t("router.groups.cancel")}
      confirmLoading={saving}
      destroyOnClose
      width={560}
    >
      <Form<FormValues>
        key={mode === "edit" ? `edit-${initialValue?.group_name ?? ""}` : "create"}
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={initialValues}
      >
        <Form.Item
          label={t("router.groups.groupName")}
          name="group_name"
          rules={[
            { required: true, message: t("router.groups.groupRequired") },
            { max: GROUP_NAME_MAX_LENGTH, message: t("router.groups.groupMax", { count: GROUP_NAME_MAX_LENGTH }) },
            {
              pattern: GROUP_NAME_PATTERN,
              message: t("router.groups.groupPattern"),
            },
            {
              validator: (_, value: string) => {
                if (!value) return Promise.resolve();
                if (reservedNames.has(value.trim().toLowerCase())) {
                  return Promise.reject(new Error(t("router.groups.groupExists")));
                }
                return Promise.resolve();
              },
            },
          ]}
          extra={t("router.groups.groupHelp")}
        >
          <Input placeholder="fast-chat" disabled={mode === "edit"} />
        </Form.Item>

        <Form.Item
          label={t("router.groups.models")}
          name="models"
          rules={[{ required: true, message: t("router.groups.modelRequired") }]}
          extra={t("router.groups.modelsHelp")}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder={t("router.groups.selectModels")}
            options={modelOptions.map((m) => ({ label: m, value: m }))}
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          label={t("router.strategy")}
          name="routing_strategy"
          rules={[{ required: true, message: t("router.groups.strategyRequired") }]}
        >
          <Select
            options={availableStrategies.map((s) => ({ label: s, value: s }))}
            placeholder={t("router.groups.selectStrategy")}
          />
        </Form.Item>

        {selectedStrategy && strategyDescriptions[selectedStrategy] && (
          <Paragraph className="text-xs text-gray-500 -mt-2 mb-4">{strategyDescriptions[selectedStrategy]}</Paragraph>
        )}

        {STRATEGIES_WITH_ARGS.has(String(selectedStrategy)) && (
          <Form.Item
            label={t("router.groups.strategyArguments")}
            name="routing_strategy_args"
            extra={
              selectedStrategy === "latency-based-routing"
                ? t("router.groups.example", { json: '{ "ttl": 3600, "lowest_latency_buffer": 0 }' })
                : t("router.groups.example", { json: '{ "ttl": 60 }' })
            }
          >
            <Input.TextArea rows={4} placeholder='{ "ttl": 3600 }' className="font-mono text-xs" />
          </Form.Item>
        )}

        <Space direction="vertical" className="w-full mt-2">
          <Text type="secondary" className="text-xs">
            {t("router.groups.unclaimed")}
          </Text>
        </Space>
      </Form>
    </Modal>
  );
};

export default RoutingGroupModal;
