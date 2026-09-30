"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useTeams } from "@/app/(dashboard)/hooks/teams/useTeams";
import { useUISettings } from "@/app/(dashboard)/hooks/uiSettings/useUISettings";
import { all_admin_roles } from "@/utils/roles";
import BetaBadge from "@/components/BetaBadge";
import CostOptimizationFeedbackBanner from "@/components/molecules/cost_optimization_feedback_banner";
import ModelInfoView from "@/components/model_info_view";
import TeamInfoView from "@/components/team/TeamInfo";
import { useModelDetailRouting } from "@/app/(dashboard)/models-and-endpoints/detailNavigation";
import { useModelDashboardData } from "@/app/(dashboard)/models-and-endpoints/useModelDashboardData";
import {
  getVisibleModelSections,
  renderModelSection,
  type ModelSectionContext,
  type ModelSectionId,
} from "@/features/models-and-endpoints/modelSections";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

export default function ModelsAndEndpointsPage() {
  const { t } = useTranslation("gateway");
  const { accessToken, userRole, userId: userID, premiumUser, isViewOnly } = useAuthorized();
  const { data: teams } = useTeams();
  const { data: uiSettings } = useUISettings();
  const queryClient = useQueryClient();
  const { modelId, teamId, close } = useModelDetailRouting();
  const { availableModelAccessGroups, allModelsOnProxy } = useModelDashboardData();

  const [activeKey, setActiveKey] = useState<ModelSectionId>("all-models");
  const [lastRefreshed, setLastRefreshed] = useState("");

  const isAdmin = all_admin_roles.includes(userRole);
  const sectionContext = useMemo<ModelSectionContext>(
    () => ({
      userRole,
      userID,
      isViewOnly,
      teams: teams ?? null,
      uiSettings: uiSettings ?? null,
    }),
    [isViewOnly, teams, uiSettings, userID, userRole],
  );
  const visibleSections = useMemo(() => getVisibleModelSections(sectionContext), [sectionContext]);
  const selectedSection = visibleSections.find((section) => section.id === activeKey) ?? visibleSections[0];

  const tabLabel = (section: (typeof visibleSections)[number]): React.ReactNode => {
    if (section.showBetaBadge) {
      return (
        <span className="flex items-center gap-2">
          {t(section.legacyTranslationKey(sectionContext))} <BetaBadge />
        </span>
      );
    }
    return t(section.legacyTranslationKey(sectionContext));
  };

  const handleRefreshClick = () => {
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    queryClient.invalidateQueries({ queryKey: ["models", "list"] });
  };

  const invalidateModels = () => queryClient.invalidateQueries({ queryKey: ["models", "list"] });

  if (teamId) {
    return (
      <div className="w-full h-full">
        <TeamInfoView
          teamId={teamId}
          onClose={close}
          accessToken={accessToken}
          is_team_admin={userRole === "Admin" && !isViewOnly}
          is_proxy_admin={userRole === "Admin" && !isViewOnly}
          userModels={allModelsOnProxy}
          editTeam={false}
          onUpdate={invalidateModels}
          premiumUser={premiumUser}
        />
      </div>
    );
  }

  return (
    <div className="mx-4">
      <div className="mt-2 flex w-full flex-col gap-2 p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t("models.title")}</h2>
            {isAdmin ? (
              <p className="text-sm text-muted-foreground">{t("models.adminSubtitle")}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{t("models.teamSubtitle")}</p>
            )}
          </div>
        </div>

        <CostOptimizationFeedbackBanner />

        {modelId ? (
          <ModelInfoView
            modelId={modelId}
            onClose={close}
            accessToken={accessToken}
            userID={userID}
            userRole={userRole}
            isViewOnly={isViewOnly}
            onModelUpdate={invalidateModels}
            modelAccessGroups={availableModelAccessGroups}
          />
        ) : (
          <Tabs
            value={selectedSection?.id}
            onValueChange={(sectionId) => {
              if (visibleSections.some((section) => section.id === sectionId)) {
                setActiveKey(sectionId as ModelSectionId);
              }
            }}
          >
            <div className="flex min-w-0 flex-nowrap items-center gap-3 border-b">
              <div className="no-scrollbar scroll-fade-e -mb-1.5 min-w-0 flex-1 overflow-x-auto pb-1.5">
                <TabsList variant="line" className="w-max justify-start">
                  {visibleSections.map((section) => {
                    return (
                      <TabsTrigger key={section.id} value={section.id} className="flex-none">
                        {tabLabel(section)}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              <div className="flex shrink-0 items-center gap-2 pb-1">
                {lastRefreshed && (
                  <span className="text-xs text-muted-foreground">{t("models.lastRefreshed", { time: lastRefreshed })}</span>
                )}
                <Button variant="ghost" size="icon-sm" onClick={handleRefreshClick} aria-label={t("models.refresh")}>
                  <RefreshCw />
                </Button>
              </div>
            </div>
            {visibleSections.map((section) => {
              return (
                <TabsContent key={section.id} value={section.id} className="pt-4">
                  {renderModelSection(section)}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}
