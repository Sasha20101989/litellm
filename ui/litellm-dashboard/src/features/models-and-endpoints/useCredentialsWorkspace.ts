import { useCredentials } from "@/app/(dashboard)/hooks/credentials/useCredentials";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import {
  credentialCreateCall,
  credentialDeleteCall,
  credentialUpdateCall,
  type CredentialItem,
} from "@/components/networking";
import { stripMaskedSecrets } from "@/utils/maskedSecretUtils";
import { isProxyAdminRole } from "@/utils/roles";
import { useCallback } from "react";

const RESTRICTED_FIELDS = new Set(["credential_name", "custom_llm_provider"]);

export function credentialFormDefaults(existingCredential?: CredentialItem | null): Record<string, unknown> {
  if (!existingCredential) return { credential_name: "", custom_llm_provider: "" };
  return {
    credential_name: existingCredential.credential_name,
    custom_llm_provider: existingCredential.credential_info?.custom_llm_provider ?? "",
    ...Object.fromEntries(
      Object.entries(existingCredential.credential_values ?? {}).map(([key, value]) => [key, value ?? null]),
    ),
  };
}

export function buildCredentialPayload(values: Record<string, unknown>, stripMaskedValues: boolean) {
  const credentialValues = Object.fromEntries(Object.entries(values).filter(([key]) => !RESTRICTED_FIELDS.has(key)));
  return {
    credential_name: String(values.credential_name),
    credential_values: stripMaskedValues ? stripMaskedSecrets(credentialValues) : credentialValues,
    credential_info: { custom_llm_provider: String(values.custom_llm_provider) },
  };
}

export function useCredentialsWorkspace() {
  const { accessToken, userRole, isViewOnly } = useAuthorized();
  const query = useCredentials();
  const canModifyCredentials = !isViewOnly && isProxyAdminRole(userRole ?? "");
  const createCredential = useCallback(
    async (values: Record<string, unknown>) => {
      if (!accessToken || !canModifyCredentials) return false;
      await credentialCreateCall(accessToken, buildCredentialPayload(values, false));
      await query.refetch();
      return true;
    },
    [accessToken, canModifyCredentials, query],
  );
  const updateCredential = useCallback(
    async (values: Record<string, unknown>) => {
      if (!accessToken || !canModifyCredentials) return false;
      const payload = buildCredentialPayload(values, true);
      await credentialUpdateCall(accessToken, payload.credential_name, payload);
      await query.refetch();
      return true;
    },
    [accessToken, canModifyCredentials, query],
  );
  const deleteCredential = useCallback(
    async (credentialName: string) => {
      if (!accessToken || !canModifyCredentials) return false;
      await credentialDeleteCall(accessToken, credentialName);
      await query.refetch();
      return true;
    },
    [accessToken, canModifyCredentials, query],
  );
  return {
    ...query,
    credentials: query.data?.credentials ?? [],
    canModifyCredentials,
    createCredential,
    updateCredential,
    deleteCredential,
  };
}
