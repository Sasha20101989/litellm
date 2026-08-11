import React, { useEffect, useState } from "react";
import { Modal, Form, Button as Button2, Select, Checkbox } from "antd";
import { Text, TextInput } from "@tremor/react";
import { getSSOSettings, updateSSOSettings } from "./networking";
import NotificationsManager from "./molecules/notifications_manager";
import { parseErrorMessage } from "./shared/errorUtils";
import { Logo } from "@/components/molecules/logo/Logo";
import { ssoProviderDisplayNames, ssoProviderLogoMap } from "./Settings/AdminSettings/SSOSettings/constants";
import { renderProviderFields } from "./Settings/AdminSettings/SSOSettings/Modals/BaseSSOSettingsForm";
import { useTranslation } from "react-i18next";

interface SSOModalsProps {
  isAddSSOModalVisible: boolean;
  isInstructionsModalVisible: boolean;
  handleAddSSOOk: () => void;
  handleAddSSOCancel: () => void;
  handleShowInstructions: (formValues: Record<string, any>) => void;
  handleInstructionsOk: () => void;
  handleInstructionsCancel: () => void;
  form: any; // Replace with proper Form type if available
  accessToken: string | null;
  ssoConfigured?: boolean; // Add optional prop to indicate if SSO is configured
}

const detectSSOProvider = (values: Record<string, unknown>): string | null => {
  if (values.google_client_id) return "google";
  if (values.microsoft_client_id) return "microsoft";
  if (values.generic_client_id) {
    const authEndpoint =
      typeof values.generic_authorization_endpoint === "string" ? values.generic_authorization_endpoint : "";
    return authEndpoint.includes("okta") || authEndpoint.includes("auth0") ? "okta" : "generic";
  }
  if (values.saml_idp_metadata_url || values.saml_idp_metadata_xml) return "saml";
  return null;
};
const SSOModals: React.FC<SSOModalsProps> = ({
  isAddSSOModalVisible,
  isInstructionsModalVisible,
  handleAddSSOOk,
  handleAddSSOCancel,
  handleShowInstructions,
  handleInstructionsOk,
  handleInstructionsCancel,
  form,
  accessToken,
  ssoConfigured = false, // Default to false if not provided
}) => {
  const { t } = useTranslation("settings");
  const [isClearConfirmModalVisible, setIsClearConfirmModalVisible] = useState(false);

  // Load existing SSO settings when modal opens
  useEffect(() => {
    const loadSSOSettings = async () => {
      if (isAddSSOModalVisible && accessToken) {
        try {
          const ssoData = await getSSOSettings(accessToken);
          if (ssoData && ssoData.values) {
            // Determine which SSO provider is configured
            const selectedProvider = detectSSOProvider(ssoData.values);

            // Extract role mappings if they exist
            let roleMappingFields = {};
            if (ssoData.values.role_mappings) {
              const roleMappings = ssoData.values.role_mappings;

              // Helper function to join arrays into comma-separated strings
              const joinTeams = (teams: string[] | undefined): string => {
                if (!teams || teams.length === 0) return "";
                return teams.join(", ");
              };

              roleMappingFields = {
                use_role_mappings: true,
                group_claim: roleMappings.group_claim,
                default_role: roleMappings.default_role || "internal_user",
                proxy_admin_teams: joinTeams(roleMappings.roles?.proxy_admin),
                admin_viewer_teams: joinTeams(roleMappings.roles?.proxy_admin_viewer),
                internal_user_teams: joinTeams(roleMappings.roles?.internal_user),
                internal_viewer_teams: joinTeams(roleMappings.roles?.internal_user_viewer),
              };
            }

            // Set form values with existing data (excluding UI access control fields)
            const formValues = {
              sso_provider: selectedProvider,
              proxy_base_url: ssoData.values.proxy_base_url,
              user_email: ssoData.values.user_email,
              ...ssoData.values,
              ...roleMappingFields,
              saml_allow_unsolicited: ssoData.values.saml_allow_unsolicited === "true",
            };

            // Clear form first, then set values with a small delay to ensure proper initialization
            form.resetFields();
            setTimeout(() => {
              form.setFieldsValue(formValues);
            }, 100);
          }
        } catch (error) {
          console.error("Failed to load SSO settings:", error);
        }
      }
    };

    loadSSOSettings();
  }, [isAddSSOModalVisible, accessToken, form]);

  // Enhanced form submission handler
  const handleFormSubmit = async (formValues: Record<string, any>) => {
    if (!accessToken) {
      NotificationsManager.fromBackend(t("admin.sso.noToken"));
      return;
    }

    try {
      const {
        proxy_admin_teams,
        admin_viewer_teams,
        internal_user_teams,
        internal_viewer_teams,
        default_role,
        group_claim,
        use_role_mappings,
        ...rest
      } = formValues;

      const payload: any = {
        ...rest,
      };

      if (typeof payload.saml_allow_unsolicited === "boolean") {
        payload.saml_allow_unsolicited = payload.saml_allow_unsolicited ? "true" : "false";
      }

      // Add role mappings if use_role_mappings is checked
      if (use_role_mappings) {
        // Helper function to split comma-separated string into array
        const splitTeams = (teams: string | undefined): string[] => {
          if (!teams || teams.trim() === "") return [];
          return teams
            .split(",")
            .map((team) => team.trim())
            .filter((team) => team.length > 0);
        };

        // Map default role display values to backend values
        const defaultRoleMapping: Record<string, string> = {
          internal_user_viewer: "internal_user_viewer",
          internal_user: "internal_user",
          proxy_admin_viewer: "proxy_admin_viewer",
          proxy_admin: "proxy_admin",
        };

        payload.role_mappings = {
          provider: "generic",
          group_claim,
          default_role: defaultRoleMapping[default_role] || "internal_user",
          roles: {
            proxy_admin: splitTeams(proxy_admin_teams),
            proxy_admin_viewer: splitTeams(admin_viewer_teams),
            internal_user: splitTeams(internal_user_teams),
            internal_user_viewer: splitTeams(internal_viewer_teams),
          },
        };
      }

      // Save SSO settings using the new API
      await updateSSOSettings(accessToken, payload);

      // Continue with the original flow (show instructions)
      handleShowInstructions(formValues);
    } catch (error: unknown) {
      NotificationsManager.fromBackend(t("admin.sso.savedFailed", { error: parseErrorMessage(error) }));
    }
  };

  // Handle clearing SSO settings
  const handleClearSSO = async () => {
    if (!accessToken) {
      NotificationsManager.fromBackend(t("admin.sso.noToken"));
      return;
    }

    try {
      // Clear all SSO settings
      const clearSettings = {
        google_client_id: null,
        google_client_secret: null,
        microsoft_client_id: null,
        microsoft_client_secret: null,
        microsoft_tenant: null,
        generic_client_id: null,
        generic_client_secret: null,
        generic_authorization_endpoint: null,
        generic_token_endpoint: null,
        generic_userinfo_endpoint: null,
        saml_idp_metadata_url: null,
        saml_idp_metadata_xml: null,
        saml_sp_entity_id: null,
        saml_allow_unsolicited: null,
        generic_scope: null,
        proxy_base_url: null,
        user_email: null,
        sso_provider: null,
        role_mappings: null,
      };

      await updateSSOSettings(accessToken, clearSettings);

      // Clear the form
      form.resetFields();

      // Close the confirmation modal
      setIsClearConfirmModalVisible(false);

      // Close the main SSO modal and trigger refresh
      handleAddSSOOk();

      NotificationsManager.success(t("admin.sso.cleared"));
    } catch (error) {
      console.error("Failed to clear SSO settings:", error);
      NotificationsManager.fromBackend(t("admin.sso.clearFailed", { error: String(error) }));
    }
  };

  // Helper function to render provider fields
  return (
    <>
      <Modal
        title={ssoConfigured ? t("admin.sso.edit") : t("admin.sso.add")}
        open={isAddSSOModalVisible}
        width={800}
        footer={null}
        onOk={handleAddSSOOk}
        onCancel={handleAddSSOCancel}
      >
        <Form
          form={form}
          onFinish={handleFormSubmit}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          labelAlign="left"
        >
          <>
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
                  <Form.Item
                    label={t("admin.sso.fields.useRoleMappings")}
                    name="use_role_mappings"
                    valuePropName="checked"
                  >
                    <Checkbox />
                  </Form.Item>
                ) : null;
              }}
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.use_role_mappings !== currentValues.use_role_mappings
              }
            >
              {({ getFieldValue }) => {
                const useRoleMappings = getFieldValue("use_role_mappings");
                return useRoleMappings ? (
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
                prevValues.use_role_mappings !== currentValues.use_role_mappings
              }
            >
              {({ getFieldValue }) => {
                const useRoleMappings = getFieldValue("use_role_mappings");
                return useRoleMappings ? (
                  <>
                    <Form.Item
                      label={t("admin.sso.fields.defaultRole")}
                      name="default_role"
                      initialValue="internal_user"
                    >
                      <Select>
                        <Select.Option value="internal_user_viewer">
                          {t("admin.sso.roles.internal_user_viewer")}
                        </Select.Option>
                        <Select.Option value="internal_user">{t("admin.sso.roles.internal_user")}</Select.Option>
                        <Select.Option value="proxy_admin_viewer">
                          {t("admin.sso.roles.proxy_admin_viewer")}
                        </Select.Option>
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
          </>
          <div
            style={{
              textAlign: "right",
              marginTop: "10px",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {ssoConfigured && (
              <Button2
                onClick={() => setIsClearConfirmModalVisible(true)}
                style={{
                  backgroundColor: "#6366f1",
                  borderColor: "#6366f1",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5558eb";
                  e.currentTarget.style.borderColor = "#5558eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6366f1";
                  e.currentTarget.style.borderColor = "#6366f1";
                }}
              >
                {t("admin.sso.clear")}
              </Button2>
            )}
            <Button2 htmlType="submit">{t("admin.sso.save")}</Button2>
          </div>
        </Form>
      </Modal>

      {/* Clear Confirmation Modal */}
      <Modal
        title={t("admin.sso.clearTitle")}
        open={isClearConfirmModalVisible}
        onOk={handleClearSSO}
        onCancel={() => setIsClearConfirmModalVisible(false)}
        okText={t("admin.sso.yesClear")}
        cancelText={t("admin.sso.cancel")}
        okButtonProps={{
          danger: true,
          style: {
            backgroundColor: "#dc2626",
            borderColor: "#dc2626",
          },
        }}
      >
        <p>{t("admin.sso.clearMessage")}</p>
      </Modal>

      <Modal
        title={t("admin.sso.instructions.title")}
        open={isInstructionsModalVisible}
        width={800}
        footer={null}
        onOk={handleInstructionsOk}
        onCancel={handleInstructionsCancel}
      >
        <p>{t("admin.sso.instructions.intro")}</p>
        <Text className="mt-2">{t("admin.sso.instructions.step1")}</Text>
        <Text className="mt-2">{t("admin.sso.instructions.step2")}</Text>
        <Text className="mt-2">{t("admin.sso.instructions.step3")}</Text>
        <Text className="mt-2">{t("admin.sso.instructions.step4")}</Text>
        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <Button2 onClick={handleInstructionsOk}>{t("admin.sso.instructions.done")}</Button2>
        </div>
      </Modal>
    </>
  );
};

export default SSOModals;
