"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Form, Input, Switch } from "antd";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createGuardrailCall, getGuardrailsList } from "@/components/networking";
import NotificationsManager from "@/components/molecules/notifications_manager";
import {
  buildCompressionGuardrailPayload,
  compressionGuardrailsOf,
  GuardrailListItem,
  GuardrailListResponse,
} from "./helpers";

interface PromptCompressionTabProps {
  accessToken: string | null;
}

interface CompressionFormValues {
  name: string;
  apiBase: string;
  defaultOn: boolean;
}

const PromptCompressionTab: React.FC<PromptCompressionTabProps> = ({ accessToken }) => {
  const { t } = useTranslation("costOptimization");
  const [form] = Form.useForm<CompressionFormValues>();
  const [guardrails, setGuardrails] = useState<GuardrailListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadGuardrails = useCallback(() => {
    if (!accessToken) {
      return;
    }
    getGuardrailsList(accessToken)
      .then((response) => setGuardrails(compressionGuardrailsOf(response as GuardrailListResponse)))
      .catch((error) => {
        console.error("Failed to load compression guardrails:", error);
        NotificationsManager.fromBackend(t("compression.loadError"));
      })
      .finally(() => setIsLoading(false));
  }, [accessToken, t]);

  useEffect(() => {
    loadGuardrails();
  }, [loadGuardrails]);

  const handleAdd = async (values: CompressionFormValues) => {
    if (!accessToken) {
      return;
    }
    setIsSaving(true);
    try {
      await createGuardrailCall(
        accessToken,
        buildCompressionGuardrailPayload({
          name: values.name,
          apiBase: values.apiBase,
          defaultOn: values.defaultOn ?? true,
        }),
      );
      NotificationsManager.success(t("compression.created"));
      form.resetFields();
      await loadGuardrails();
    } catch (error) {
      console.error("Failed to create compression guardrail:", error);
      NotificationsManager.fromBackend(t("compression.createError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("compression.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("compression.description")} {" "}
            <a
              href="https://docs.litellm.ai/docs/proxy/headroom"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {t("compression.docs")}
            </a>
          </p>
          {isLoading && <p className="text-sm text-muted-foreground">{t("compression.loading")}</p>}
          {!isLoading && guardrails.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("compression.empty")}
            </p>
          )}
          {!isLoading && guardrails.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {guardrails.map((guardrail) => (
                <li key={guardrail.guardrail_id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{guardrail.guardrail_name}</p>
                    <p className="text-xs text-muted-foreground">{guardrail.litellm_params?.api_base ?? ""}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      guardrail.litellm_params?.default_on
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {guardrail.litellm_params?.default_on ? t("compression.alwaysOn") : t("compression.optIn")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("compression.addTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleAdd}
            initialValues={{ defaultOn: true }}
          >
            <Form.Item
              name="name"
              label={t("compression.name")}
              rules={[{ required: true, message: t("compression.nameRequired") }]}
            >
              <Input placeholder="headroom-compression" />
            </Form.Item>
            <Form.Item
              name="apiBase"
              label={t("compression.apiBase")}
              tooltip={t("compression.apiBaseTooltip")}
              extra={t("compression.apiBaseExtra")}
              rules={[{ required: true, message: t("compression.apiBaseRequired") }]}
            >
              <Input placeholder="https://your-headroom-endpoint" />
            </Form.Item>
            <Form.Item name="defaultOn" label={t("compression.applyAll")} valuePropName="checked">
              <Switch />
            </Form.Item>
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                {t("compression.enterpriseNotice")} {" "}
                <a
                  href="https://www.litellm.ai/#pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {t("page.here")}
                </a>
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="primary" htmlType="submit" loading={isSaving}>
                {t("compression.add")}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptCompressionTab;
