import { Form, Input, Switch } from "antd";
import React from "react";
import { CoordinationField } from "./coordinationRedisFields";
import { useTranslation } from "react-i18next";

export const SECRET_ALREADY_SET_PLACEHOLDER = "Already set. Enter a new value to replace it.";

interface CoordinationRedisFormFieldProps {
  field: CoordinationField;
  isSecretConfigured: boolean;
}

const renderControl = (field: CoordinationField, placeholder: string): React.ReactNode => {
  switch (field.type) {
    case "boolean":
      return <Switch />;
    case "password":
      return <Input.Password placeholder={placeholder} autoComplete="new-password" />;
    case "integer":
      return <Input inputMode="numeric" placeholder={placeholder} />;
    case "list":
      return <Input.TextArea rows={4} placeholder={placeholder} />;
    default:
      return <Input placeholder={placeholder} />;
  }
};

const CoordinationRedisFormField: React.FC<CoordinationRedisFormFieldProps> = ({ field, isSecretConfigured }) => {
  const { t } = useTranslation("settings");
  const label = t(`caching.fields.${field.name}.label`, { defaultValue: field.label });
  const help = t(`caching.fields.${field.name}.help`, { defaultValue: field.helpText });
  return (
    <Form.Item
      name={field.name}
      label={label}
      extra={help}
      rules={field.rules}
      valuePropName={field.type === "boolean" ? "checked" : "value"}
    >
      {renderControl(field, isSecretConfigured ? t("caching.settings.secretSet") : help)}
    </Form.Item>
  );
};

export default CoordinationRedisFormField;
