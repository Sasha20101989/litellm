import React from "react";
import type { DateRangePickerValue } from "@tremor/react";
import { useTranslation } from "react-i18next";

interface ExportSummaryProps {
  dateRange: DateRangePickerValue;
  selectedFilters: string[];
}

const ExportSummary: React.FC<ExportSummaryProps> = ({ dateRange, selectedFilters }) => {
  const { t, i18n } = useTranslation("usage");
  const locale = i18n.language === "ru" ? "ru-RU" : "en-US";
  return (
    <div className="text-sm text-gray-500">
      {dateRange.from?.toLocaleDateString(locale)} - {dateRange.to?.toLocaleDateString(locale)}
      {selectedFilters.length > 0 && ` · ${t("export.filters", { count: selectedFilters.length })}`}
    </div>
  );
};

export default ExportSummary;
