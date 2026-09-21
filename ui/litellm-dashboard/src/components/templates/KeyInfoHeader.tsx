import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowLeftRight,
  Ban,
  Building2,
  Calendar,
  CircleCheck,
  Clock,
  MoreVertical,
  Plus,
  RefreshCw,
  ShieldCheck,
  Timer,
  Trash2,
  User,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CopyButton from "@/components/shared/CopyButton";
import { EntityLink } from "@/components/shared/EntityLink";
import { orgDetailHref, teamDetailHref, userDetailHref } from "@/utils/entityLinks";
import LabeledField from "../common_components/LabeledField";
import DefaultProxyAdminTag from "../common_components/DefaultProxyAdminTag";

export interface KeyInfoData {
  keyName: string;
  keyId: string;
  userId: string;
  userEmail: string;
  userAlias?: string | null;
  teamId: string;
  teamAlias?: string | null;
  orgId: string;
  orgAlias?: string | null;
  createdBy: string;
  createdById: string;
  createdAt: string;
  lastUpdated: string;
  lastActive: string;
  expires: string;
}

interface KeyInfoHeaderProps {
  data: KeyInfoData;
  onBack?: () => void;
  onCreateNew?: () => void;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onResetSpend?: () => void;
  onToggleBlocked?: () => void;
  isBlocked?: boolean;
  canModifyKey?: boolean;
  backButtonText?: string;
  regenerateDisabled?: boolean;
  regenerateTooltip?: string;
}

function UserField({ userAlias, userEmail, userId }: { userAlias?: string | null; userEmail: string; userId: string }) {
  const { t } = useTranslation("gateway");
  const labelEl = (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground">
        <User className="size-3.5" />
      </span>
      <span className="text-xs uppercase tracking-[0.05em] text-muted-foreground">{t("virtualKeys.columns.user")}</span>
    </div>
  );

  const isEmpty = !userAlias && !userEmail && !userId;
  if (isEmpty) {
    return (
      <div>
        {labelEl}
        <div>
          <span className="font-semibold">-</span>
        </div>
      </div>
    );
  }

  const isDefaultAdmin = userId === "default_user_id";
  const displayValue = userAlias || userEmail || userId;

  const popoverContent = (
    <div className="flex flex-col gap-2 text-xs min-w-[200px] max-w-[300px]">
      {[
        { label: t("virtualKeys.columns.userAlias"), value: userAlias ?? null },
        { label: t("virtualKeys.columns.userEmail"), value: userEmail || null },
        { label: t("virtualKeys.columns.userId"), value: userId || null },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col min-w-0">
          <span className="text-muted-foreground">{label}</span>
          {value ? (
            <div className="flex min-w-0 items-center gap-1">
              <span className="min-w-0 flex-1 truncate font-mono text-xs" title={value}>
                {value}
              </span>
              <CopyButton
                value={value}
                label={t("virtualKeys.values.copyField", { field: label })}
                iconClassName="size-3.5"
              />
            </div>
          ) : (
            <span className="font-mono">-</span>
          )}
        </div>
      ))}
    </div>
  );

  if (isDefaultAdmin && !userAlias && !userEmail) {
    return (
      <div>
        {labelEl}
        <div>
          <HoverCard>
            <HoverCardTrigger
              render={
                <span className="cursor-default">
                  <DefaultProxyAdminTag userId={userId} />
                </span>
              }
            />
            <HoverCardContent side="bottom" align="start" className="w-auto">
              {popoverContent}
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      {labelEl}
      <div>
        <HoverCard>
          <HoverCardTrigger
            render={
              <span className="block max-w-[200px] cursor-default truncate font-semibold">
                {userId ? <EntityLink href={userDetailHref(userId)}>{displayValue}</EntityLink> : displayValue}
              </span>
            }
          />
          <HoverCardContent side="bottom" align="start" className="w-auto">
            {popoverContent}
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
}

export function KeyInfoHeader({
  data,
  onBack,
  onCreateNew,
  onRegenerate,
  onDelete,
  onResetSpend,
  onToggleBlocked,
  isBlocked = false,
  canModifyKey = true,
  backButtonText,
  regenerateDisabled = false,
  regenerateTooltip,
}: KeyInfoHeaderProps) {
  const { t } = useTranslation("gateway");
  const regenerateButton = (
    <span>
      <Button variant="outline" onClick={onRegenerate} disabled={regenerateDisabled}>
        <RefreshCw className="size-3.5" />
        {t("virtualKeys.details.regenerateKey")}
      </Button>
    </span>
  );

  return (
    <div>
      {onCreateNew && (
        <div style={{ marginBottom: 16 }}>
          <Button onClick={onCreateNew}>
            <Plus className="size-3.5" />
            {t("virtualKeys.details.createNewKey")}
          </Button>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-3.5" />
          {backButtonText ?? t("virtualKeys.details.back")}
        </Button>
      </div>

      <div className="flex items-start justify-between" style={{ marginBottom: 20 }}>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="m-0 flex items-center gap-1 text-2xl font-semibold">
              {data.keyName}
              <CopyButton value={data.keyName} label={t("virtualKeys.details.copyAlias")} iconClassName="size-4" />
            </h3>
            {isBlocked && (
              <Badge variant="destructive">
                <Ban className="size-3" />
                {t("virtualKeys.status.blocked")}
              </Badge>
            )}
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <span className="min-w-0 break-words text-muted-foreground">
              {t("virtualKeys.columns.keyId")}: {data.keyId}
            </span>
            <CopyButton value={data.keyId} label={t("virtualKeys.details.copyId")} iconClassName="size-3.5" />
          </div>
        </div>
        {canModifyKey && (
          <div className="flex items-center gap-2">
            {regenerateTooltip ? (
              <TooltipProvider delay={300}>
                <Tooltip>
                  <TooltipTrigger render={regenerateButton} />
                  <TooltipContent>{regenerateTooltip}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              regenerateButton
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="icon" aria-label={t("virtualKeys.details.moreActions")} />}
              >
                <MoreVertical className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto">
                {onToggleBlocked &&
                  (isBlocked ? (
                    <DropdownMenuItem onClick={onToggleBlocked}>
                      <CircleCheck className="size-3.5" />
                      {t("virtualKeys.details.unblockKey")}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem variant="destructive" onClick={onToggleBlocked}>
                      <Ban className="size-3.5" />
                      {t("virtualKeys.details.blockKey")}
                    </DropdownMenuItem>
                  ))}
                {onResetSpend && (
                  <DropdownMenuItem variant="destructive" onClick={onResetSpend}>
                    <ArrowLeftRight className="size-3.5" />
                    {t("virtualKeys.details.resetSpend")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2 className="size-3.5" />
                  {t("virtualKeys.details.deleteKey")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex items-stretch gap-10" style={{ marginBottom: 40 }}>
        <div className="flex min-w-0 flex-col gap-4">
          <UserField userAlias={data.userAlias} userEmail={data.userEmail} userId={data.userId} />
          <LabeledField
            label={t("virtualKeys.details.expires")}
            value={data.expires}
            icon={<Timer className="size-3.5" />}
          />
        </div>

        <Separator orientation="vertical" />

        <div className="flex min-w-0 flex-col gap-4">
          <LabeledField
            label={t("virtualKeys.columns.createdAt")}
            value={data.createdAt}
            icon={<Calendar className="size-3.5" />}
          />
          <LabeledField
            label={t("virtualKeys.columns.createdBy")}
            value={data.createdBy}
            icon={<ShieldCheck className="size-3.5" />}
            href={data.createdById ? userDetailHref(data.createdById) : undefined}
            truncate
            copyable
            defaultUserIdCheck
          />
        </div>

        <Separator orientation="vertical" />

        <div className="flex min-w-0 flex-col gap-4">
          <LabeledField
            label={t("virtualKeys.columns.updatedAt")}
            value={data.lastUpdated}
            icon={<Clock className="size-3.5" />}
          />
          <LabeledField
            label={t("virtualKeys.columns.lastActive")}
            value={data.lastActive}
            icon={<Zap className="size-3.5" />}
          />
        </div>

        <Separator orientation="vertical" />

        <div className="flex min-w-0 flex-col gap-4">
          <LabeledField
            label={t("virtualKeys.columns.team")}
            value={data.teamAlias || data.teamId}
            icon={<Users className="size-3.5" />}
            href={data.teamId ? teamDetailHref(data.teamId) : undefined}
            truncate
          />
          <LabeledField
            label={t("virtualKeys.columns.organization")}
            value={data.orgAlias || data.orgId}
            icon={<Building2 className="size-3.5" />}
            href={data.orgId ? orgDetailHref(data.orgId) : undefined}
            truncate
          />
        </div>
      </div>
    </div>
  );
}
