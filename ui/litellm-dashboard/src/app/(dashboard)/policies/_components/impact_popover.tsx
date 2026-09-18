import React, { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PolicyAttachment } from "@/components/policies/types";
import { estimateAttachmentImpactCall } from "@/components/networking";
import { useTranslation } from "react-i18next";

interface ImpactResult {
  affected_keys_count: number;
  affected_teams_count: number;
  sample_keys: string[];
  sample_teams: string[];
}

const ImpactPopover: React.FC<{ attachment: PolicyAttachment; accessToken: string | null }> = ({
  attachment,
  accessToken,
}) => {
  const { t } = useTranslation("gateway");
  const [impact, setImpact] = useState<ImpactResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadImpact = async () => {
    if (loaded || loading || !accessToken) return;
    setLoading(true);
    try {
      const data = await estimateAttachmentImpactCall(accessToken, {
        policy_name: attachment.policy_name,
        scope: attachment.scope,
        teams: attachment.teams,
        keys: attachment.keys,
        models: attachment.models,
        tags: attachment.tags,
      });
      setImpact(data);
      setLoaded(true);
    } catch (error) {
      console.error("Failed to load impact:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) loadImpact();
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={
                  <Button variant="ghost" size="icon-xs" aria-label={t("policies.impact.viewBlastRadius")}>
                    <Eye />
                  </Button>
                }
              />
            }
          />
          <TooltipContent>{t("policies.impact.viewBlastRadius")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-72 gap-2">
        <PopoverTitle>{t("policies.impact.blastRadius")}</PopoverTitle>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            {t("policies.impact.loading")}
          </div>
        ) : impact ? (
          <div className="text-xs">
            {impact.affected_keys_count === -1 ? (
              <p className="font-medium text-foreground">{t("policies.impact.globalShort")}</p>
            ) : (
              <>
                <p className="mb-1">
                  {t("policies.impact.popoverAffected", {
                    keys: impact.affected_keys_count,
                    teams: impact.affected_teams_count,
                  })}
                </p>
                {impact.sample_keys.length > 0 && (
                  <div className="mb-1 flex flex-wrap items-center gap-1">
                    <span className="text-muted-foreground">{t("policies.impact.keys")}:</span>
                    {impact.sample_keys.map((key: string) => (
                      <Badge key={key} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                        {key}
                      </Badge>
                    ))}
                  </div>
                )}
                {impact.sample_teams.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-muted-foreground">{t("policies.impact.teams")}:</span>
                    {impact.sample_teams.map((team: string) => (
                      <Badge key={team} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                        {team}
                      </Badge>
                    ))}
                  </div>
                )}
                {impact.affected_keys_count === 0 && impact.affected_teams_count === 0 && (
                  <p className="text-muted-foreground">{t("policies.impact.noneAffected")}</p>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("policies.impact.clickToLoad")}</p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ImpactPopover;
