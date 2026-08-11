import React from "react";
import { Radio } from "antd";
import type { ExportScope, EntityType } from "./types";
import { useTranslation } from "react-i18next";

interface ExportTypeSelectorProps {
  value: ExportScope;
  onChange: (value: ExportScope) => void;
  entityType: EntityType;
}

const ExportTypeSelector: React.FC<ExportTypeSelectorProps> = ({ value, onChange, entityType }) => {
  const { t } = useTranslation("usage");
  const entityLabel = t(`entity.labels.${entityType}`);
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">{t("export.type")}</label>
      <Radio.Group value={value} onChange={(e) => onChange(e.target.value)} className="w-full">
        <div className="space-y-2">
          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <Radio value="daily" className="mt-0.5" />
            <div className="ml-3 flex-1">
              <div className="font-medium text-sm">{t("export.dailyTitle", { entity: entityLabel })}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {t("export.dailyDescription", { entity: entityLabel })}
              </div>
            </div>
          </label>

          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <Radio value="daily_with_keys" className="mt-0.5" />
            <div className="ml-3 flex-1">
              <div className="font-medium text-sm">{t("export.keysTitle", { entity: entityLabel })}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t("export.keysDescription", { entity: entityLabel })}</div>
            </div>
          </label>

          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <Radio value="daily_with_models" className="mt-0.5" />
            <div className="ml-3 flex-1">
              <div className="font-medium text-sm">{t("export.modelsTitle", { entity: entityLabel })}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t("export.modelsDescription")}</div>
            </div>
          </label>
        </div>
      </Radio.Group>
    </div>
  );
};

export default ExportTypeSelector;
