import React from "react";
import { Select } from "antd";
import type { ExportFormat } from "./types";
import { useTranslation } from "react-i18next";

interface ExportFormatSelectorProps {
  value: ExportFormat;
  onChange: (value: ExportFormat) => void;
}

const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation("usage");
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">{t("export.format")}</label>
      <Select
        value={value}
        onChange={onChange}
        className="w-full"
        options={[
          {
            value: "csv",
            label: t("export.csv"),
          },
          {
            value: "json",
            label: t("export.json"),
          },
        ]}
      />
    </div>
  );
};

export default ExportFormatSelector;
