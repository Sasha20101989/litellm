import React from "react";
import { Form, Input, InputNumber, Select, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, TextInput } from "@tremor/react";
import { OAUTH_FLOW } from "@/components/mcp_tools/types";
import TokenEndpointAuthMethodField from "./TokenEndpointAuthMethodField";
import { useTranslation } from "react-i18next";

interface OAuthFlowStatus {
  startOAuthFlow: () => void;
  status: string;
  error: string | null;
  tokenResponse: { access_token?: string; expires_in?: number } | null;
}

interface OAuthFormFieldsProps {
  isM2M: boolean;
  isEditing?: boolean;
  oauthFlow?: OAuthFlowStatus;
  initialFlowType?: string;
  /** Link to provider docs for creating an OAuth app (e.g. GitHub). */
  docsUrl?: string | null;
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

const UpstreamResourceField: React.FC = () => {
  const { t } = useTranslation("gateway");
  return (
    <Form.Item
      label={
        <FieldLabel label={t("mcpServers.auth.oauth.resource")} tooltip={t("mcpServers.auth.oauth.resourceTooltip")} />
      }
      name={["credentials", "upstream_resource"]}
    >
      <TextInput placeholder="auto, or https://mcp.example.com/mcp" className={fieldClassName} />
    </Form.Item>
  );
};

const OAuthFormFields: React.FC<OAuthFormFieldsProps> = ({
  isM2M,
  isEditing = false,
  oauthFlow,
  initialFlowType,
  docsUrl,
}) => {
  const { t } = useTranslation("gateway");
  const placeholderSuffix = isEditing ? t("mcpServers.auth.keepExisting") : "";
  const requiredWhenCreating = (message: string) => (isEditing ? [] : [{ required: true, message }]);

  return (
    <>
      <Form.Item
        label={
          <FieldLabel
            label={t("mcpServers.auth.oauth.flowType")}
            tooltip={t("mcpServers.auth.oauth.flowTypeTooltip")}
          />
        }
        name="oauth_flow_type"
        {...(initialFlowType ? { initialValue: initialFlowType } : {})}
      >
        <Select placeholder={t("mcpServers.auth.oauth.selectFlow")} className="rounded-lg" size="large">
          <Select.Option value={OAUTH_FLOW.M2M}>
            <div>
              <span className="font-medium">{t("mcpServers.auth.oauth.m2m")}</span>
              <span className="text-gray-400 text-xs ml-2">{t("mcpServers.auth.oauth.m2mHint")}</span>
            </div>
          </Select.Option>
          <Select.Option value={OAUTH_FLOW.INTERACTIVE}>
            <div>
              <span className="font-medium">{t("mcpServers.auth.oauth.interactive")}</span>
              <span className="text-gray-400 text-xs ml-2">{t("mcpServers.auth.oauth.interactiveHint")}</span>
            </div>
          </Select.Option>
        </Select>
      </Form.Item>

      {isM2M ? (
        <>
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.clientId")}
                tooltip={t("mcpServers.auth.oauth.clientIdM2MTooltip")}
              />
            }
            name={["credentials", "client_id"]}
            rules={requiredWhenCreating(t("mcpServers.auth.oauth.clientIdM2MRequired"))}
          >
            <TextInput
              type="password"
              placeholder={t("mcpServers.auth.oauth.clientIdPlaceholder", { suffix: placeholderSuffix })}
              className={fieldClassName}
            />
          </Form.Item>
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.clientSecret")}
                tooltip={t("mcpServers.auth.oauth.clientSecretM2MTooltip")}
              />
            }
            name={["credentials", "client_secret"]}
            rules={requiredWhenCreating(t("mcpServers.auth.oauth.clientSecretM2MRequired"))}
          >
            <TextInput
              type="password"
              placeholder={t("mcpServers.auth.oauth.clientSecretPlaceholder", { suffix: placeholderSuffix })}
              className={fieldClassName}
            />
          </Form.Item>
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.tokenUrl")}
                tooltip={t("mcpServers.auth.oauth.tokenUrlTooltip")}
              />
            }
            name="token_url"
            rules={requiredWhenCreating(t("mcpServers.auth.oauth.tokenUrlRequired"))}
          >
            <TextInput placeholder="https://auth.example.com/oauth/token" className={fieldClassName} />
          </Form.Item>
          <TokenEndpointAuthMethodField isEditing={isEditing} />
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.scopesOptional")}
                tooltip={t("mcpServers.auth.oauth.scopesM2MTooltip")}
              />
            }
            name={["credentials", "scopes"]}
          >
            <Select
              mode="tags"
              tokenSeparators={[","]}
              placeholder={t("mcpServers.auth.oauth.addScopes")}
              className="rounded-lg"
              size="large"
            />
          </Form.Item>
          <UpstreamResourceField />
        </>
      ) : (
        <>
          <Form.Item
            label={
              <span className="flex items-center justify-between w-full">
                <FieldLabel
                  label={t("mcpServers.auth.oauth.clientIdOptional")}
                  tooltip={t("mcpServers.auth.oauth.clientIdInteractiveTooltip")}
                />
                {docsUrl && (
                  <a
                    href={docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 ml-2 font-normal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("mcpServers.auth.oauth.createApp")}
                  </a>
                )}
              </span>
            }
            name={["credentials", "client_id"]}
          >
            <TextInput
              type="password"
              placeholder={t("mcpServers.auth.oauth.clientIdShortPlaceholder", { suffix: placeholderSuffix })}
              className={fieldClassName}
            />
          </Form.Item>
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.clientSecretOptional")}
                tooltip={t("mcpServers.auth.oauth.clientSecretInteractiveTooltip")}
              />
            }
            name={["credentials", "client_secret"]}
          >
            <TextInput
              type="password"
              placeholder={t("mcpServers.auth.oauth.clientSecretShortPlaceholder", { suffix: placeholderSuffix })}
              className={fieldClassName}
            />
          </Form.Item>
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.scopesOptional")}
                tooltip={t("mcpServers.auth.oauth.scopesInteractiveTooltip")}
              />
            }
            name={["credentials", "scopes"]}
          >
            <Select
              mode="tags"
              tokenSeparators={[","]}
              placeholder={t("mcpServers.auth.oauth.addScopes")}
              className="rounded-lg"
              size="large"
            />
          </Form.Item>
          <UpstreamResourceField />
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.issuer")}
                tooltip={t("mcpServers.auth.oauth.issuerTooltip")}
              />
            }
            name="issuer"
          >
            <TextInput placeholder="https://issuer.example.com" className={fieldClassName} />
          </Form.Item>
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.authorizationUrl")}
                tooltip={t("mcpServers.auth.oauth.authorizationUrlTooltip")}
              />
            }
            name="authorization_url"
          >
            <TextInput placeholder="https://example.com/oauth/authorize" className={fieldClassName} />
          </Form.Item>
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.tokenUrlOptional")}
                tooltip={t("mcpServers.auth.oauth.tokenUrlOptionalTooltip")}
              />
            }
            name="token_url"
          >
            <TextInput placeholder="https://example.com/oauth/token" className={fieldClassName} />
          </Form.Item>
          <TokenEndpointAuthMethodField isEditing={isEditing} />
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.registrationUrl")}
                tooltip={t("mcpServers.auth.oauth.registrationUrlTooltip")}
              />
            }
            name="registration_url"
          >
            <TextInput placeholder="https://example.com/oauth/register" className={fieldClassName} />
          </Form.Item>
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.validationRules")}
                tooltip={t("mcpServers.auth.oauth.validationRulesTooltip")}
              />
            }
            name="token_validation_json"
            rules={[
              {
                validator: (_: any, value: string) => {
                  if (!value || value.trim() === "") return Promise.resolve();
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject(new Error(t("mcpServers.auth.oauth.validJson")));
                  }
                },
              },
            ]}
          >
            <Input.TextArea
              placeholder={'{\n  "organization": "my-org",\n  "team.id": "123"\n}'}
              rows={4}
              className="font-mono text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </Form.Item>
          <Form.Item
            label={
              <FieldLabel
                label={t("mcpServers.auth.oauth.storageTtl")}
                tooltip={t("mcpServers.auth.oauth.storageTtlTooltip")}
              />
            }
            name="token_storage_ttl_seconds"
          >
            <InputNumber min={1} placeholder="e.g. 3600" className="w-full rounded-lg" style={{ width: "100%" }} />
          </Form.Item>
          {oauthFlow && (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 space-y-2">
              <p className="text-sm text-gray-600">{t("mcpServers.auth.oauth.authorizeHint")}</p>
              <Button
                variant="secondary"
                onClick={oauthFlow.startOAuthFlow}
                disabled={oauthFlow.status === "authorizing" || oauthFlow.status === "exchanging"}
              >
                {oauthFlow.status === "authorizing"
                  ? t("mcpServers.auth.oauth.waiting")
                  : oauthFlow.status === "exchanging"
                    ? t("mcpServers.auth.oauth.exchanging")
                    : t("mcpServers.auth.oauth.authorize")}
              </Button>
              {oauthFlow.error && <p className="text-sm text-red-500">{oauthFlow.error}</p>}
              {oauthFlow.status === "success" && oauthFlow.tokenResponse?.access_token && (
                <p className="text-sm text-green-600">
                  {t("mcpServers.auth.oauth.tokenFetched", {
                    seconds: oauthFlow.tokenResponse.expires_in ?? "?",
                  })}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default OAuthFormFields;
