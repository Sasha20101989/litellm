"use client";

import { TextInput } from "@tremor/react";
import { Checkbox, Form, Input, Select } from "antd";
import React from "react";
import { ssoProviderLogoMap, ssoProviderDisplayNames } from "../constants";
import { Logo } from "@/components/molecules/logo/Logo";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

export interface BaseSSOSettingsFormProps {
  form: any; // Replace with proper Form type if available
  onFormSubmit: (formValues: Record<string, any>) => Promise<void>;
}

// Define the SSO provider configuration type
export interface SSOProviderConfig {
  envVarMap: Record<string, string>;
  fields: Array<{
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
    type?: "password" | "textarea" | "checkbox";
  }>;
}

// Define configurations for each SSO provider
export const ssoProviderConfigs: Record<string, SSOProviderConfig> = {
  google: {
    envVarMap: {
      google_client_id: "GOOGLE_CLIENT_ID",
      google_client_secret: "GOOGLE_CLIENT_SECRET",
    },
    fields: [
      { label: "Google Client ID", name: "google_client_id" },
      { label: "Google Client Secret", name: "google_client_secret" },
    ],
  },
  microsoft: {
    envVarMap: {
      microsoft_client_id: "MICROSOFT_CLIENT_ID",
      microsoft_client_secret: "MICROSOFT_CLIENT_SECRET",
      microsoft_tenant: "MICROSOFT_TENANT",
    },
    fields: [
      { label: "Microsoft Client ID", name: "microsoft_client_id" },
      { label: "Microsoft Client Secret", name: "microsoft_client_secret" },
      { label: "Microsoft Tenant", name: "microsoft_tenant" },
    ],
  },
  okta: {
    envVarMap: {
      generic_client_id: "GENERIC_CLIENT_ID",
      generic_client_secret: "GENERIC_CLIENT_SECRET",
      generic_authorization_endpoint: "GENERIC_AUTHORIZATION_ENDPOINT",
      generic_token_endpoint: "GENERIC_TOKEN_ENDPOINT",
      generic_userinfo_endpoint: "GENERIC_USERINFO_ENDPOINT",
      generic_scope: "GENERIC_SCOPE",
    },
    fields: [
      { label: "Generic Client ID", name: "generic_client_id" },
      { label: "Generic Client Secret", name: "generic_client_secret" },
      {
        label: "Authorization Endpoint",
        name: "generic_authorization_endpoint",
        placeholder: "https://your-domain/authorize",
      },
      { label: "Token Endpoint", name: "generic_token_endpoint", placeholder: "https://your-domain/token" },
      {
        label: "Userinfo Endpoint",
        name: "generic_userinfo_endpoint",
        placeholder: "https://your-domain/userinfo",
      },
      { label: "Scopes", name: "generic_scope", placeholder: "openid email profile", required: false },
    ],
  },
  generic: {
    envVarMap: {
      generic_client_id: "GENERIC_CLIENT_ID",
      generic_client_secret: "GENERIC_CLIENT_SECRET",
      generic_authorization_endpoint: "GENERIC_AUTHORIZATION_ENDPOINT",
      generic_token_endpoint: "GENERIC_TOKEN_ENDPOINT",
      generic_userinfo_endpoint: "GENERIC_USERINFO_ENDPOINT",
      generic_scope: "GENERIC_SCOPE",
    },
    fields: [
      { label: "Generic Client ID", name: "generic_client_id" },
      { label: "Generic Client Secret", name: "generic_client_secret" },
      { label: "Authorization Endpoint", name: "generic_authorization_endpoint" },
      { label: "Token Endpoint", name: "generic_token_endpoint" },
      { label: "Userinfo Endpoint", name: "generic_userinfo_endpoint" },
      { label: "Scopes", name: "generic_scope", placeholder: "openid email profile", required: false },
    ],
  },
  saml: {
    envVarMap: {
      saml_idp_metadata_url: "SAML_IDP_METADATA_URL",
      saml_idp_metadata_xml: "SAML_IDP_METADATA_XML",
      saml_sp_entity_id: "SAML_SP_ENTITY_ID",
      saml_allow_unsolicited: "SAML_ALLOW_UNSOLICITED",
    },
    fields: [
      {
        label: "IdP Metadata URL",
        name: "saml_idp_metadata_url",
        required: false,
        placeholder: "https://idp.example.com/metadata (use this or the metadata XML below)",
      },
      {
        label: "IdP Metadata XML",
        name: "saml_idp_metadata_xml",
        required: false,
        type: "textarea",
        placeholder: "Paste the IdP metadata XML here if you do not have a metadata URL",
      },
      {
        label: "SP Entity ID",
        name: "saml_sp_entity_id",
        required: false,
        placeholder: "Defaults to <proxy base url>/sso/saml/metadata",
      },
      {
        label: "Allow IdP-initiated (unsolicited) responses",
        name: "saml_allow_unsolicited",
        required: false,
        type: "checkbox",
      },
    ],
  },
};

// Helper function to render provider fields
export const renderProviderFields = (provider: string, t: TFunction) => {
  const config = ssoProviderConfigs[provider];
  if (!config) return null;

  const fieldLabels: Record<string, string> = {
    google_client_id: t("admin.sso.fields.google_client_id"),
    google_client_secret: t("admin.sso.fields.google_client_secret"),
    microsoft_client_id: t("admin.sso.fields.microsoft_client_id"),
    microsoft_client_secret: t("admin.sso.fields.microsoft_client_secret"),
    microsoft_tenant: t("admin.sso.fields.microsoft_tenant"),
    generic_client_id: t("admin.sso.fields.generic_client_id"),
    generic_client_secret: t("admin.sso.fields.generic_client_secret"),
    generic_authorization_endpoint: t("admin.sso.fields.generic_authorization_endpoint"),
    generic_token_endpoint: t("admin.sso.fields.generic_token_endpoint"),
    generic_userinfo_endpoint: t("admin.sso.fields.generic_userinfo_endpoint"),
    generic_scope: t("admin.sso.fields.generic_scope"),
    saml_idp_metadata_url: t("admin.sso.fields.saml_idp_metadata_url"),
    saml_idp_metadata_xml: t("admin.sso.fields.saml_idp_metadata_xml"),
    saml_sp_entity_id: t("admin.sso.fields.saml_sp_entity_id"),
    saml_allow_unsolicited: t("admin.sso.fields.saml_allow_unsolicited"),
  };

  return config.fields.map((field) => {
    const fieldLabel = fieldLabels[field.name] || field.label;
    const isRequired = field.required !== false;
    const rules = isRequired
      ? [{ required: true, message: t("admin.sso.fields.enterField", { field: fieldLabel.toLowerCase() }) }]
      : [];
    let control: React.ReactNode;
    if (field.type === "checkbox") {
      control = <Checkbox />;
    } else if (field.type === "textarea") {
      control = <Input.TextArea rows={4} placeholder={field.placeholder} />;
    } else if (field.type === "password" || field.name.includes("client")) {
      control = <Input.Password />;
    } else {
      control = <TextInput placeholder={field.placeholder} />;
    }
    return (
      <Form.Item
        key={field.name}
        label={fieldLabel}
        name={field.name}
        rules={rules}
        valuePropName={field.type === "checkbox" ? "checked" : undefined}
      >
        {control}
      </Form.Item>
    );
  });
};

const BaseSSOSettingsForm: React.FC<BaseSSOSettingsFormProps> = ({ form, onFormSubmit }) => {
  const { t } = useTranslation("settings");

  return (
    <div>
      <Form form={form} onFinish={onFormSubmit} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} labelAlign="left">
        <Form.Item
          label={t("admin.sso.fields.ssoProvider")}
          name="sso_provider"
          rules={[{ required: true, message: t("admin.sso.fields.selectProvider") }]}
        >
          <Select>
            {Object.entries(ssoProviderLogoMap).map(([value, logo]) => (
              <Select.Option key={value} value={value}>
                <div style={{ display: "flex", alignItems: "center", padding: "4px 0" }}>
                  {logo && (
                    <Logo
                      src={logo}
                      label={ssoProviderDisplayNames[value] || value}
                      className="h-6 w-6 mr-3 object-contain"
                    />
                  )}
                  <span>
                    {ssoProviderDisplayNames[value] || value.charAt(0).toUpperCase() + value.slice(1) + " SSO"}
                  </span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.sso_provider !== currentValues.sso_provider}
        >
          {({ getFieldValue }) => {
            const provider = getFieldValue("sso_provider");
            return provider ? renderProviderFields(provider, t) : null;
          }}
        </Form.Item>

        <Form.Item
          label={t("admin.sso.fields.proxyAdminEmail")}
          name="user_email"
          rules={[{ required: true, message: t("admin.sso.fields.enterAdminEmail") }]}
        >
          <TextInput />
        </Form.Item>
        <Form.Item
          label={t("admin.sso.fields.proxyBaseUrl")}
          name="proxy_base_url"
          normalize={(value) => value?.trim()}
          rules={[
            { required: true, message: t("admin.sso.fields.enterProxyUrl") },
            {
              pattern: /^https?:\/\/.+/,
              message: t("admin.sso.fields.urlProtocol"),
            },
            {
              validator: (_, value) => {
                // Only check for trailing slash if the URL starts with http:// or https://
                if (value && /^https?:\/\/.+/.test(value) && value.endsWith("/")) {
                  return Promise.reject(t("admin.sso.fields.noTrailingSlash"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <TextInput placeholder="https://example.com" />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.sso_provider !== currentValues.sso_provider}
        >
          {({ getFieldValue }) => {
            const provider = getFieldValue("sso_provider");
            return provider === "okta" || provider === "generic" ? (
              <Form.Item label={t("admin.sso.fields.useRoleMappings")} name="use_role_mappings" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.use_role_mappings !== currentValues.use_role_mappings ||
            prevValues.sso_provider !== currentValues.sso_provider
          }
        >
          {({ getFieldValue }) => {
            const useRoleMappings = getFieldValue("use_role_mappings");
            const provider = getFieldValue("sso_provider");
            const supportsRoleMappings = provider === "okta" || provider === "generic";
            return useRoleMappings && supportsRoleMappings ? (
              <Form.Item
                label={t("admin.sso.fields.groupClaim")}
                name="group_claim"
                rules={[{ required: true, message: t("admin.sso.fields.enterGroupClaim") }]}
              >
                <TextInput />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.use_role_mappings !== currentValues.use_role_mappings ||
            prevValues.sso_provider !== currentValues.sso_provider
          }
        >
          {({ getFieldValue }) => {
            const useRoleMappings = getFieldValue("use_role_mappings");
            const provider = getFieldValue("sso_provider");
            const supportsRoleMappings = provider === "okta" || provider === "generic";
            return useRoleMappings && supportsRoleMappings ? (
              <>
                <Form.Item label={t("admin.sso.fields.defaultRole")} name="default_role" initialValue="internal_user">
                  <Select>
                    <Select.Option value="internal_user_viewer">{t("admin.sso.roles.internal_user_viewer")}</Select.Option>
                    <Select.Option value="internal_user">{t("admin.sso.roles.internal_user")}</Select.Option>
                    <Select.Option value="proxy_admin_viewer">{t("admin.sso.roles.proxy_admin_viewer")}</Select.Option>
                    <Select.Option value="proxy_admin">{t("admin.sso.roles.proxy_admin")}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item label={t("admin.sso.fields.proxyAdminTeams")} name="proxy_admin_teams">
                  <TextInput />
                </Form.Item>

                <Form.Item label={t("admin.sso.fields.adminViewerTeams")} name="admin_viewer_teams">
                  <TextInput />
                </Form.Item>

                <Form.Item label={t("admin.sso.fields.internalUserTeams")} name="internal_user_teams">
                  <TextInput />
                </Form.Item>

                <Form.Item label={t("admin.sso.fields.internalViewerTeams")} name="internal_viewer_teams">
                  <TextInput />
                </Form.Item>
              </>
            ) : null;
          }}
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.sso_provider !== currentValues.sso_provider}
        >
          {({ getFieldValue }) => {
            const provider = getFieldValue("sso_provider");
            return provider === "okta" || provider === "generic" ? (
              <Form.Item label={t("admin.sso.fields.useTeamMappings")} name="use_team_mappings" valuePropName="checked">
                <Checkbox />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.use_team_mappings !== currentValues.use_team_mappings ||
            prevValues.sso_provider !== currentValues.sso_provider
          }
        >
          {({ getFieldValue }) => {
            const useTeamMappings = getFieldValue("use_team_mappings");
            const provider = getFieldValue("sso_provider");
            const supportsTeamMappings = provider === "okta" || provider === "generic";
            return useTeamMappings && supportsTeamMappings ? (
              <Form.Item
                label={t("admin.sso.fields.teamIdsJwt")}
                name="team_ids_jwt_field"
                rules={[{ required: true, message: t("admin.sso.fields.enterTeamIdsJwt") }]}
              >
                <TextInput />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>
      </Form>
    </div>
  );
};

export default BaseSSOSettingsForm;
