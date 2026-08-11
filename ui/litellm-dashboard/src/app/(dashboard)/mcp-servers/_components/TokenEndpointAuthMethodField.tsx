import React from "react";
import { Form, Select, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const TOKEN_ENDPOINT_AUTH_METHOD_OPTIONS = [
  { value: "client_secret_basic", label: "Client Secret Basic" },
  { value: "client_secret_post", label: "Client Secret Post" },
];

interface TokenEndpointAuthMethodFieldProps {
  isEditing?: boolean;
}

const TokenEndpointAuthMethodField: React.FC<TokenEndpointAuthMethodFieldProps> = ({ isEditing = false }) => {
  const { t } = useTranslation("gateway");
  return (
    <Form.Item
      label={
        <span className="text-sm font-medium text-gray-700 flex items-center">
          {t("mcpServers.auth.tokenEndpoint.label")}
          <Tooltip title={t("mcpServers.auth.tokenEndpoint.tooltip")}>
            <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
          </Tooltip>
        </span>
      }
      name={["credentials", "token_endpoint_auth_method"]}
    >
      <Select
        allowClear
        placeholder={
          isEditing ? t("mcpServers.auth.tokenEndpoint.keepExisting") : t("mcpServers.auth.tokenEndpoint.default")
        }
        className="rounded-lg"
        size="large"
        options={TOKEN_ENDPOINT_AUTH_METHOD_OPTIONS}
      />
    </Form.Item>
  );
};

export default TokenEndpointAuthMethodField;
