import React from "react";
import { RobotOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  hasVariables: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasVariables }) => {
  const { t } = useTranslation("prompts");
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400">
      <RobotOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
      <span className="text-base">{hasVariables ? t("variables.fillThenMessage") : t("variables.typeMessage")}</span>
    </div>
  );
};

export default EmptyState;
