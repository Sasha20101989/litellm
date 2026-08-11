import React, { useEffect, useState } from "react";
import { Form, Button as Button2, Select } from "antd";
import { Text, TextInput } from "@tremor/react";
import { getSSOSettings, updateSSOSettings } from "./networking";
import NotificationManager from "./molecules/notifications_manager";
import { useTranslation } from "react-i18next";

interface UIAccessControlFormProps {
  accessToken: string | null;
  onSuccess: () => void;
}

// Separate UI Access Control Form Component
const UIAccessControlForm: React.FC<UIAccessControlFormProps> = ({ accessToken, onSuccess }) => {
  const { t } = useTranslation("settings");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Load existing UI access control settings
  useEffect(() => {
    const loadUIAccessSettings = async () => {
      if (accessToken) {
        try {
          const ssoData = await getSSOSettings(accessToken);
          if (ssoData && ssoData.values) {
            // Handle nested ui_access_mode structure
            const uiAccessMode = ssoData.values.ui_access_mode;
            let formValues = {};

            if (uiAccessMode && typeof uiAccessMode === "object") {
              formValues = {
                ui_access_mode_type: uiAccessMode.type,
                restricted_sso_group: uiAccessMode.restricted_sso_group,
                sso_group_jwt_field: uiAccessMode.sso_group_jwt_field,
              };
            } else if (typeof uiAccessMode === "string") {
              // Handle legacy flat structure
              formValues = {
                ui_access_mode_type: uiAccessMode,
                restricted_sso_group: ssoData.values.restricted_sso_group,
                sso_group_jwt_field: ssoData.values.team_ids_jwt_field || ssoData.values.sso_group_jwt_field,
              };
            }

            form.setFieldsValue(formValues);
          }
        } catch (error) {
          console.error("Failed to load UI access settings:", error);
        }
      }
    };

    loadUIAccessSettings();
  }, [accessToken, form]);

  const handleUIAccessSubmit = async (formValues: Record<string, any>) => {
    if (!accessToken) {
      NotificationManager.fromBackend(t("admin.accessControl.noToken"));
      return;
    }

    setLoading(true);
    try {
      // Transform form data to match API expected structure
      let apiPayload;

      if (formValues.ui_access_mode_type === "all_authenticated_users") {
        // Set ui_access_mode to none when all_authenticated_users is selected
        apiPayload = {
          ui_access_mode: "none",
        };
      } else {
        apiPayload = {
          ui_access_mode: {
            type: formValues.ui_access_mode_type,
            restricted_sso_group: formValues.restricted_sso_group,
            sso_group_jwt_field: formValues.sso_group_jwt_field,
          },
        };
      }

      await updateSSOSettings(accessToken, apiPayload);
      onSuccess();
    } catch (error) {
      console.error("Failed to save UI access settings:", error);
      NotificationManager.fromBackend(t("admin.accessControl.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Text style={{ fontSize: "14px", color: "#6b7280" }}>
          {t("admin.accessControl.description")}
        </Text>
      </div>

      <Form form={form} onFinish={handleUIAccessSubmit} layout="vertical">
        <Form.Item
          label={t("admin.accessControl.mode")}
          name="ui_access_mode_type"
          tooltip={t("admin.accessControl.modeTooltip")}
        >
          <Select placeholder={t("admin.accessControl.selectMode")}>
            <Select.Option value="all_authenticated_users">{t("admin.accessControl.allUsers")}</Select.Option>
            <Select.Option value="restricted_sso_group">{t("admin.accessControl.restrictedGroup")}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.ui_access_mode_type !== currentValues.ui_access_mode_type
          }
        >
          {({ getFieldValue }) => {
            const uiAccessModeType = getFieldValue("ui_access_mode_type");
            return uiAccessModeType === "restricted_sso_group" ? (
              <Form.Item
                label={t("admin.accessControl.restrictedGroup")}
                name="restricted_sso_group"
                rules={[{ required: true, message: t("admin.accessControl.restrictedRequired") }]}
              >
                <TextInput placeholder="ui-access-group" />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item
          label={t("admin.accessControl.jwtField")}
          name="sso_group_jwt_field"
          tooltip={t("admin.accessControl.jwtTooltip")}
        >
          <TextInput placeholder="groups" />
        </Form.Item>

        <div style={{ textAlign: "right", marginTop: "16px" }}>
          <Button2
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              backgroundColor: "#6366f1",
              borderColor: "#6366f1",
            }}
          >
            {t("admin.accessControl.update")}
          </Button2>
        </div>
      </Form>
    </div>
  );
};

export default UIAccessControlForm;
