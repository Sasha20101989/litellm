import React from "react";
import { Form, Input, Select, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface TokenExchangeFormFieldsProps {
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

const TokenExchangeFormFields: React.FC<TokenExchangeFormFieldsProps> = ({ isEditing = false }) => {
  const { t } = useTranslation("gateway");
  const placeholderSuffix = isEditing ? t("mcpServers.forms.common.keepExisting") : "";

  return (
    <>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.tokenExchange.profile")}
            tooltip={t("mcpServers.forms.tokenExchange.profileTooltip")}
          />
        }
        name="token_exchange_profile"
        {...(isEditing ? {} : { initialValue: "rfc8693" })}
      >
        <Select className="rounded-lg" size="large">
          <Select.Option value="rfc8693">
            <span className="font-medium">{t("mcpServers.forms.tokenExchange.rfc")}</span>
          </Select.Option>
          <Select.Option value="entra_obo">
            <span className="font-medium">{t("mcpServers.forms.tokenExchange.entra")}</span>
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.tokenExchange.endpoint")}
            tooltip={t("mcpServers.forms.tokenExchange.endpointTooltip")}
          />
        }
        name="token_exchange_endpoint"
      >
        <Input placeholder="https://idp.example.com/oauth2/token" className={fieldClassName} />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.tokenExchange.clientId")}
            tooltip={t("mcpServers.forms.tokenExchange.clientIdTooltip")}
          />
        }
        name={["credentials", "client_id"]}
        rules={[{ required: !isEditing, message: t("mcpServers.forms.tokenExchange.clientIdRequired") }]}
      >
        <Input.Password
          placeholder={t("mcpServers.forms.tokenExchange.clientIdPlaceholder", { suffix: placeholderSuffix })}
          className={fieldClassName}
        />
      </Form.Item>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.forms.tokenExchange.clientSecret")}
            tooltip={t("mcpServers.forms.tokenExchange.clientSecretTooltip")}
          />
        }
        name={["credentials", "client_secret"]}
        rules={[{ required: !isEditing, message: t("mcpServers.forms.tokenExchange.clientSecretRequired") }]}
      >
        <Input.Password
          placeholder={t("mcpServers.forms.tokenExchange.clientSecretPlaceholder", { suffix: placeholderSuffix })}
          className={fieldClassName}
        />
      </Form.Item>
      <Form.Item noStyle shouldUpdate={(prev, cur) => prev.token_exchange_profile !== cur.token_exchange_profile}>
        {({ getFieldValue }) => {
          const isEntraObo = getFieldValue("token_exchange_profile") === "entra_obo";
          return (
            <>
              {!isEntraObo && (
                <>
                  <Form.Item
                    label={
                      <FieldLabel
                        label={t("mcpServers.forms.tokenExchange.audience")}
                        tooltip={t("mcpServers.forms.tokenExchange.audienceTooltip")}
                      />
                    }
                    name="audience"
                  >
                    <Input placeholder="https://upstream.example.com" className={fieldClassName} />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FieldLabel
                        label={t("mcpServers.forms.tokenExchange.subjectType")}
                        tooltip={t("mcpServers.forms.tokenExchange.subjectTypeTooltip")}
                      />
                    }
                    name="subject_token_type"
                  >
                    <Input placeholder="urn:ietf:params:oauth:token-type:access_token" className={fieldClassName} />
                  </Form.Item>
                </>
              )}
              <Form.Item
                label={
                  <FieldLabel
                    label={
                      isEntraObo
                        ? t("mcpServers.forms.tokenExchange.scopes")
                        : t("mcpServers.forms.tokenExchange.scopesOptional")
                    }
                    tooltip={
                      isEntraObo
                        ? t("mcpServers.forms.tokenExchange.entraScopesTooltip")
                        : t("mcpServers.forms.tokenExchange.scopesTooltip")
                    }
                  />
                }
                name={["credentials", "scopes"]}
                rules={
                  isEntraObo
                    ? [
                        {
                          required: true,
                          message: t("mcpServers.forms.tokenExchange.entraScopeRequired"),
                        },
                      ]
                    : []
                }
              >
                <Select
                  mode="tags"
                  tokenSeparators={[","]}
                  placeholder={isEntraObo ? "api://<app-id>/.default" : t("mcpServers.forms.common.addScopes")}
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>
            </>
          );
        }}
      </Form.Item>
    </>
  );
};

export default TokenExchangeFormFields;
