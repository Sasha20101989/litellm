import React from "react";
import { Card, Text } from "@tremor/react";
import VariableTextArea from "../variable_textarea";
import { useTranslation } from "react-i18next";

interface DeveloperMessageCardProps {
  value: string;
  onChange: (value: string) => void;
}

const DeveloperMessageCard: React.FC<DeveloperMessageCardProps> = ({ value, onChange }) => {
  const { t } = useTranslation("prompts");
  return (
    <Card className="p-3">
      <Text className="block mb-2 text-sm font-medium">{t("editor.developerMessage")}</Text>
      <Text className="text-gray-500 text-xs mb-2">{t("editor.developerHelp")}</Text>
      <VariableTextArea value={value} onChange={onChange} rows={3} placeholder={t("editor.developerPlaceholder")} />
    </Card>
  );
};

export default DeveloperMessageCard;
