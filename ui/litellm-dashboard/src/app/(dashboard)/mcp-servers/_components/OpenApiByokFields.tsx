import React from "react";
import { Form, Input, Select, Switch, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const OpenApiByokFields: React.FC = () => {
  const { t } = useTranslation("gateway");
  return (
    <>
    <Form.Item
      label={
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {t("mcpServers.forms.byok.title")}
          <Tooltip title={t("mcpServers.forms.byok.tooltip")}>
            <InfoCircleOutlined className="text-blue-400 hover:text-blue-600 cursor-help" />
          </Tooltip>
        </span>
      }
      name="is_byok"
      valuePropName="checked"
    >
      <Switch />
    </Form.Item>

    <Form.Item noStyle shouldUpdate={(prev, cur) => prev.is_byok !== cur.is_byok || prev.auth_type !== cur.auth_type}>
      {({ getFieldValue }) =>
        getFieldValue("is_byok") ? (
          <>
            {/* Auth format hint */}
            {getFieldValue("auth_type") && getFieldValue("auth_type") !== "none" && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                <InfoCircleOutlined className="mt-0.5 shrink-0" />
                <span>
                  {t("mcpServers.forms.byok.sentAs")}{" "}
                  <code className="font-mono bg-blue-100 px-1 rounded-sm">
                    {getFieldValue("auth_type") === "bearer_token" && "Authorization: Bearer {key}"}
                    {getFieldValue("auth_type") === "token" && "Authorization: token {key}"}
                    {getFieldValue("auth_type") === "api_key" && "x-api-key: {key}"}
                    {getFieldValue("auth_type") === "basic" && "Authorization: Basic {key}"}
                    {getFieldValue("auth_type") === "authorization" && "Authorization: {key}"}
                  </code>
                  {!getFieldValue("auth_type") && t("mcpServers.forms.byok.selectAuth")}
                </span>
              </div>
            )}
            {!getFieldValue("auth_type") && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700 flex items-start gap-2">
                <InfoCircleOutlined className="mt-0.5 shrink-0" />
                <span>
                  {t("mcpServers.forms.byok.selectAuth")}
                </span>
              </div>
            )}
            <Form.Item
              label={
                <span className="text-sm font-medium text-gray-700">
                  {t("mcpServers.forms.byok.accessDescription")}
                  <Tooltip title={t("mcpServers.forms.byok.accessDescriptionTooltip")}>
                    <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
                  </Tooltip>
                </span>
              }
              name="byok_description"
            >
              <Select
                mode="tags"
                placeholder={t("mcpServers.forms.byok.accessDescriptionPlaceholder")}
                className="w-full"
                tokenSeparators={[","]}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-sm font-medium text-gray-700">
                  {t("mcpServers.forms.byok.helpUrl")}
                  <Tooltip title={t("mcpServers.forms.byok.helpUrlTooltip")}>
                    <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
                  </Tooltip>
                </span>
              }
              name="byok_api_key_help_url"
            >
              <Input placeholder="https://docs.example.com/api-keys" />
            </Form.Item>
          </>
        ) : null
      }
    </Form.Item>
    </>
  );
};

export default OpenApiByokFields;
