import { Form, Input, Select, Switch } from "antd";
import React from "react";
import { CacheField } from "./cacheSettingsFields";
import { useTranslation } from "react-i18next";

export interface EmbeddingModelOption {
  value: string;
  label: string;
}

export const SECRET_ALREADY_SET_PLACEHOLDER = "Already set. Enter a new value to replace it.";

interface CacheFormFieldProps {
  field: CacheField;
  embeddingModels: EmbeddingModelOption[];
  isSecretConfigured?: boolean;
}

const renderControl = (
  field: CacheField,
  embeddingModels: EmbeddingModelOption[],
  placeholder: string,
  modelPlaceholder: string,
): React.ReactNode => {
  switch (field.type) {
    case "boolean":
      return <Switch />;
    case "password":
      return <Input.Password placeholder={placeholder} autoComplete="new-password" />;
    case "integer":
    case "float":
      return <Input inputMode="decimal" placeholder={placeholder} />;
    case "list":
      return <Input.TextArea rows={4} placeholder={placeholder} />;
    case "model-select":
      return (
        <Select
          showSearch
          allowClear
          placeholder={modelPlaceholder}
          options={embeddingModels}
          optionFilterProp="label"
          style={{ width: "100%" }}
        />
      );
    default:
      return <Input placeholder={placeholder} />;
  }
};

const CacheFormField: React.FC<CacheFormFieldProps> = ({ field, embeddingModels, isSecretConfigured = false }) => {
  const { t } = useTranslation("settings");
  const label = t(`caching.fields.${field.name}.label`, { defaultValue: field.label });
  const help = t(`caching.fields.${field.name}.help`, { defaultValue: field.helpText });
  const placeholder = isSecretConfigured ? t("caching.settings.secretSet") : help;
  return (
    <Form.Item
      name={field.name}
      label={label}
      extra={help}
      rules={field.rules}
      valuePropName={field.type === "boolean" ? "checked" : "value"}
    >
      {renderControl(field, embeddingModels, placeholder, t("caching.settings.searchModel"))}
    </Form.Item>
  );
};

export default CacheFormField;
