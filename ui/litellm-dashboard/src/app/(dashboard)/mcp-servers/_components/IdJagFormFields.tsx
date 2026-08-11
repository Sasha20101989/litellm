import React from "react";
import { Form, Input, Select, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface IdJagFormFieldsProps {
  isEditing?: boolean;
}

const fieldClassName = "rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500";

const FieldLabel: React.FC<{ label: string; tooltip: string }> = ({ label, tooltip }) => (
  <span className="text-sm font-medium text-gray-700 flex items-center">
    {label}
    <Tooltip title={tooltip}>
      <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
    </Tooltip>
  </span>
);

const IdJagFormFields: React.FC<IdJagFormFieldsProps> = ({ isEditing = false }) => {
  const { t } = useTranslation("gateway");
  const placeholderSuffix = isEditing ? t("mcpServers.forms.common.keepExisting") : "";

  return (
    <>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.orgEndpoint")}
            tooltip={t("mcpServers.forms.idJag.orgEndpointTooltip")}
          />
        }
        name="token_exchange_endpoint"
        rules={[{ required: !isEditing, message: t("mcpServers.forms.idJag.orgEndpointRequired") }]}
      >
        <Input placeholder="https://your-org.okta.com/oauth2/v1/token" className={fieldClassName} />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.resourceEndpoint")}
            tooltip={t("mcpServers.forms.idJag.resourceEndpointTooltip")}
          />
        }
        name={["credentials", "id_jag_resource_token_endpoint"]}
        rules={[{ required: !isEditing, message: t("mcpServers.forms.idJag.resourceEndpointRequired") }]}
      >
        <Input placeholder="https://upstream.example.com/oauth2/token" className={fieldClassName} />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.clientId")}
            tooltip={t("mcpServers.forms.idJag.clientIdTooltip")}
          />
        }
        name={["credentials", "client_id"]}
        rules={[{ required: !isEditing, message: t("mcpServers.forms.idJag.clientIdRequired") }]}
      >
        <Input.Password
          placeholder={t("mcpServers.forms.tokenExchange.clientIdPlaceholder", { suffix: placeholderSuffix })}
          className={fieldClassName}
        />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.clientSecret")}
            tooltip={t("mcpServers.forms.idJag.clientSecretTooltip")}
          />
        }
        name={["credentials", "client_secret"]}
        dependencies={[["credentials", "client_private_key"]]}
        rules={[
          ({ getFieldValue }) => ({
            validator: (_, value) => {
              if (isEditing || value || getFieldValue(["credentials", "client_private_key"])) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(t("mcpServers.forms.idJag.credentialRequired")));
            },
          }),
        ]}
      >
        <Input.Password
          placeholder={t("mcpServers.forms.tokenExchange.clientSecretPlaceholder", { suffix: placeholderSuffix })}
          className={fieldClassName}
        />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.privateKey")}
            tooltip={t("mcpServers.forms.idJag.privateKeyTooltip")}
          />
        }
        name={["credentials", "client_private_key"]}
      >
        <Input.TextArea
          rows={3}
          placeholder={`-----BEGIN PRIVATE KEY-----${placeholderSuffix}`}
          className={fieldClassName}
        />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.privateKeyId")}
            tooltip={t("mcpServers.forms.idJag.privateKeyIdTooltip")}
          />
        }
        name={["credentials", "client_private_key_id"]}
      >
        <Input placeholder="my-signing-key-1" className={fieldClassName} />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.signingAlgorithm")}
            tooltip={t("mcpServers.forms.idJag.signingAlgorithmTooltip")}
          />
        }
        name={["credentials", "client_assertion_signing_alg"]}
      >
        <Input placeholder="RS256" className={fieldClassName} />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.audience")}
            tooltip={t("mcpServers.forms.idJag.audienceTooltip")}
          />
        }
        name="audience"
      >
        <Input placeholder="https://upstream.example.com" className={fieldClassName} />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.resource")}
            tooltip={t("mcpServers.forms.idJag.resourceTooltip")}
          />
        }
        name={["credentials", "id_jag_resource"]}
      >
        <Input placeholder="https://upstream.example.com/mcp" className={fieldClassName} />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.subjectType")}
            tooltip={t("mcpServers.forms.idJag.subjectTypeTooltip")}
          />
        }
        name="subject_token_type"
      >
        <Input placeholder="urn:ietf:params:oauth:token-type:id_token" className={fieldClassName} />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.idJag.scopes")}
            tooltip={t("mcpServers.forms.idJag.scopesTooltip")}
          />
        }
        name={["credentials", "scopes"]}
      >
        <Select
          mode="tags"
          tokenSeparators={[","]}
          placeholder={t("mcpServers.forms.common.addScopes")}
          className="rounded-lg"
          size="large"
        />
      </Form.Item>
    </>
  );
};

export default IdJagFormFields;
