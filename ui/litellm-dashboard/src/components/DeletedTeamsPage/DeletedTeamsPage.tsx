"use client";
import { Alert } from "antd";
import { useDeletedTeams } from "@/app/(dashboard)/hooks/teams/useTeams";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { DeletedTeamsTable } from "./DeletedTeamsTable/DeletedTeamsTable";
import { useTranslation } from "react-i18next";

export default function DeletedTeamsPage() {
  const { t } = useTranslation("logs");
  const { premiumUser } = useAuthorized();
  const { data: teamsData, isLoading } = useDeletedTeams(1, 100);

  return (
    <div className="flex flex-col gap-4">
      {!premiumUser && (
        <Alert
          type="info"
          banner
          showIcon
          message={t("deleted.enterpriseSoon")}
          description={t("deleted.teamsNotice")}
        />
      )}
      <DeletedTeamsTable teams={teamsData || []} isLoading={isLoading} />
    </div>
  );
}
