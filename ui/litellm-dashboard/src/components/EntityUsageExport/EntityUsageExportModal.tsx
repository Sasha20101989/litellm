import { useTeams } from "@/app/(dashboard)/hooks/teams/useTeams";
import { createTeamAliasMap } from "@/utils/teamUtils";
import { Button, Modal, Skeleton } from "antd";
import React, { useMemo, useState } from "react";
import NotificationsManager from "../molecules/notifications_manager";
import ExportFormatSelector from "./ExportFormatSelector";
import ExportSummary from "./ExportSummary";
import ExportTypeSelector from "./ExportTypeSelector";
import type { EntityUsageExportModalProps, ExportFormat, ExportScope } from "./types";
import { handleExportCSV, handleExportJSON } from "./utils";
import { useTranslation } from "react-i18next";

const EntityUsageExportModal: React.FC<EntityUsageExportModalProps> = ({
  isOpen,
  onClose,
  entityType,
  spendData,
  dateRange,
  selectedFilters,
  customTitle,
}) => {
  const { t } = useTranslation("usage");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [exportScope, setExportScope] = useState<ExportScope>("daily");
  const [isExporting, setIsExporting] = useState(false);
  const { data: teams, isLoading: isLoadingTeams } = useTeams();

  const entityLabel = t(`entity.labels.${entityType}`);
  const exportEntityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const modalTitle = customTitle || t("export.title", { entity: entityLabel });

  // Cache team alias map using useMemo
  const teamAliasMap = useMemo(() => createTeamAliasMap(teams), [teams]);
  const handleExport = async (format?: ExportFormat) => {
    const formatToUse = format || exportFormat;
    setIsExporting(true);
    try {
      if (formatToUse === "csv") {
        handleExportCSV(spendData, exportScope, exportEntityLabel, entityType, teamAliasMap);
        NotificationsManager.success(t("export.success", { entity: entityLabel, format: "CSV" }));
      } else {
        handleExportJSON(spendData, exportScope, exportEntityLabel, entityType, dateRange, selectedFilters, teamAliasMap);
        NotificationsManager.success(t("export.success", { entity: entityLabel, format: "JSON" }));
      }
      onClose();
    } catch (error) {
      console.error("Error exporting data:", error);
      NotificationsManager.fromBackend(t("export.failure"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      title={<span className="text-base font-semibold">{modalTitle}</span>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={480}
    >
      <div className="space-y-5 py-2">
        {isLoadingTeams ? (
          <Skeleton active />
        ) : (
          <>
            <ExportSummary dateRange={dateRange} selectedFilters={selectedFilters} />
            <ExportTypeSelector value={exportScope} onChange={setExportScope} entityType={entityType} />
            <ExportFormatSelector value={exportFormat} onChange={setExportFormat} />
          </>
        )}
        {isLoadingTeams ? (
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Skeleton.Button active />
            <Skeleton.Button active />
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="outlined" onClick={onClose} disabled={isExporting}>
              {t("export.cancel")}
            </Button>
            <Button
              onClick={() => handleExport()}
              loading={isExporting || isLoadingTeams}
              disabled={isExporting || isLoadingTeams}
              type="primary"
            >
              {isExporting
                ? t("export.exporting")
                : t("export.exportFormat", { format: exportFormat.toUpperCase() })}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EntityUsageExportModal;
