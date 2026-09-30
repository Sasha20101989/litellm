"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ShieldOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UiLoadingSpinner } from "@/components/ui/ui-loading-spinner";
import { fetchMCPServerUserCredentials, revokeMCPServerUserCredential } from "@/components/networking";
import type { MCPServerUserCredentialListItem } from "@/components/mcp_tools/types";
import { createQueryKeys } from "@/app/(dashboard)/hooks/common/queryKeysFactory";

const mcpServerUserCredentialKeys = createQueryKeys("mcpServerUserCredentials");

export function credentialTypeLabel(credentialType: MCPServerUserCredentialListItem["credential_type"]): string {
  return credentialType === "oauth2" ? "OAuth2" : "BYOK API key";
}

export function formatTimestamp(value: string | null, locale?: string): string {
  if (value === null) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString(locale);
}

function CredentialsBody({
  items,
  error,
  isLoading,
  onRevoke,
  t,
  locale,
}: {
  items: MCPServerUserCredentialListItem[] | undefined;
  error: Error | null;
  isLoading: boolean;
  onRevoke: ((item: MCPServerUserCredentialListItem) => void) | null;
  t: (key: string, options?: Record<string, unknown>) => string;
  locale: string;
}) {
  if (isLoading) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card p-12"
      >
        <UiLoadingSpinner className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("mcpServers.userCredentials.loading")}</p>
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("mcpServers.userCredentials.loadError")}</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!items) return null;
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">{t("mcpServers.userCredentials.empty")}</p>
      </div>
    );
  }
  return (
    <section aria-label={t("mcpServers.userCredentials.stored")} className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("mcpServers.userCredentials.user")}</TableHead>
            <TableHead>{t("mcpServers.userCredentials.type")}</TableHead>
            <TableHead>{t("mcpServers.userCredentials.connected")}</TableHead>
            <TableHead>{t("mcpServers.userCredentials.expires")}</TableHead>
            <TableHead>{t("mcpServers.userCredentials.updated")}</TableHead>
            {onRevoke ? <TableHead className="text-right">{t("mcpServers.userCredentials.actions")}</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.user_id}>
              <TableCell className="font-mono text-xs">{item.user_id}</TableCell>
              <TableCell>
                <Badge variant="secondary">{t(`mcpServers.userCredentials.types.${item.credential_type}`)}</Badge>
              </TableCell>
              <TableCell className="text-xs">{formatTimestamp(item.connected_at, locale)}</TableCell>
              <TableCell className="text-xs">{formatTimestamp(item.expires_at, locale)}</TableCell>
              <TableCell className="text-xs">{formatTimestamp(item.updated_at, locale)}</TableCell>
              {onRevoke ? (
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRevoke(item)}
                    aria-label={t("mcpServers.userCredentials.revokeForUser", { user: item.user_id })}
                  >
                    <ShieldOff className="size-4" />
                    {t("mcpServers.userCredentials.revoke")}
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

interface MCPServerUserCredentialsPanelProps {
  serverId: string;
  accessToken: string | null;
  canRevoke: boolean;
}

export function MCPServerUserCredentialsPanel({
  serverId,
  accessToken,
  canRevoke,
}: MCPServerUserCredentialsPanelProps) {
  const { t, i18n } = useTranslation("gateway");
  const queryClient = useQueryClient();
  const [pendingItem, setPendingItem] = useState<MCPServerUserCredentialListItem | null>(null);
  const queryKey = mcpServerUserCredentialKeys.detail(serverId);
  const { data, error, isLoading, isFetching, refetch } = useQuery<MCPServerUserCredentialListItem[], Error>({
    queryKey,
    queryFn: () => fetchMCPServerUserCredentials(accessToken!, serverId),
    enabled: !!accessToken,
  });
  const revoke = useMutation<void, Error, MCPServerUserCredentialListItem>({
    mutationFn: (item) => revokeMCPServerUserCredential(accessToken!, serverId, item.user_id, item.credential_type),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
  const confirmRevoke = () => {
    if (pendingItem === null) return;
    revoke.mutate(pendingItem);
    setPendingItem(null);
  };

  return (
    <div className="space-y-4" data-testid="mcp-server-user-credentials-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">{t("mcpServers.userCredentials.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("mcpServers.userCredentials.description")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label={t("mcpServers.userCredentials.refresh")}
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          {t("mcpServers.userCredentials.refresh")}
        </Button>
      </div>

      {revoke.isError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("mcpServers.userCredentials.revokeError")}</AlertTitle>
          <AlertDescription>{revoke.error.message}</AlertDescription>
        </Alert>
      ) : null}
      {revoke.isSuccess ? (
        <Alert>
          <AlertTitle>{t("mcpServers.userCredentials.revoked")}</AlertTitle>
          <AlertDescription>
            {t("mcpServers.userCredentials.revokedDescription", {
              type: t(`mcpServers.userCredentials.types.${revoke.variables.credential_type}`),
              user: revoke.variables.user_id,
            })}
          </AlertDescription>
        </Alert>
      ) : null}

      <CredentialsBody
        items={data}
        error={error}
        isLoading={isLoading}
        onRevoke={canRevoke ? setPendingItem : null}
        t={t}
        locale={i18n.language}
      />

      <AlertDialog open={pendingItem !== null} onOpenChange={(open) => !open && setPendingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
          <AlertDialogTitle>{t("mcpServers.userCredentials.revokeTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingItem
                ? t("mcpServers.userCredentials.revokeDescription", {
                    type: t(`mcpServers.userCredentials.types.${pendingItem.credential_type}`),
                    user: pendingItem.user_id,
                  })
                : ""}
              {pendingItem ? " " : ""}
              {t("mcpServers.userCredentials.revokeConsequence")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setPendingItem(null)}>
              {t("mcpServers.userCredentials.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmRevoke} disabled={revoke.isPending}>
              {t("mcpServers.userCredentials.revoke")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MCPServerUserCredentialsPanel;
