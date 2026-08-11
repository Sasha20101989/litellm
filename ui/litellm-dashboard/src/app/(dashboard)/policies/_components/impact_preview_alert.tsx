import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/shared/Alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ImpactResult {
  affected_keys_count: number;
  affected_teams_count: number;
  sample_keys: string[];
  sample_teams: string[];
}

interface ImpactPreviewAlertProps {
  impactResult: ImpactResult;
}

interface SampleListProps {
  label: string;
  samples: string[];
  totalCount: number;
}

const SampleList: React.FC<SampleListProps> = ({ label, samples, totalCount }) => {
  const { t } = useTranslation("gateway");

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}: </span>
      {samples.slice(0, 5).map((sample) => (
        <Badge key={sample} variant="outline">
          {sample}
        </Badge>
      ))}
      {totalCount > 5 && (
        <span className="text-xs text-muted-foreground">{t("policies.impact.more", { count: totalCount - 5 })}</span>
      )}
    </div>
  );
};

const ImpactPreviewAlert: React.FC<ImpactPreviewAlertProps> = ({ impactResult }) => {
  const { t } = useTranslation("gateway");
  const isGlobal = impactResult.affected_keys_count === -1;

  return (
    <Alert className="mb-4">
      {isGlobal ? <AlertTriangle /> : <Info />}
      <AlertTitle>{t("policies.impact.previewTitle")}</AlertTitle>
      <AlertDescription>
        {isGlobal ? (
          <span>
            {t("policies.impact.globalPrefix")} <strong>{t("policies.impact.allKeysAndTeams")}</strong>.
          </span>
        ) : (
          <div>
            <span>
              {t("policies.impact.attachmentAffects")}{" "}
              <strong>
                {t(impactResult.affected_keys_count === 1 ? "policies.impact.keyOne" : "policies.impact.keyMany", {
                  count: impactResult.affected_keys_count,
                })}
              </strong>{" "}
              {t("policies.impact.and")}{" "}
              <strong>
                {t(impactResult.affected_teams_count === 1 ? "policies.impact.teamOne" : "policies.impact.teamMany", {
                  count: impactResult.affected_teams_count,
                })}
              </strong>
              .
            </span>
            {impactResult.sample_keys.length > 0 && (
              <SampleList
                label={t("policies.impact.keys")}
                samples={impactResult.sample_keys}
                totalCount={impactResult.affected_keys_count}
              />
            )}
            {impactResult.sample_teams.length > 0 && (
              <SampleList
                label={t("policies.impact.teams")}
                samples={impactResult.sample_teams}
                totalCount={impactResult.affected_teams_count}
              />
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ImpactPreviewAlert;
