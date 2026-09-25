import {
  type CredentialItem,
  type Model,
  credentialCreateCall,
  credentialGetCall,
  modelCreateCall,
  modelPatchUpdateCall,
} from "@/components/networking";
import type { QueryClient } from "@tanstack/react-query";

export type ModelCommandResult<T> = { status: "success"; value: T } | { status: "blocked" };

export interface ModelCommandAccess {
  accessToken: string | null;
  canMutate: boolean;
  isViewOnly: boolean;
}

const canMutate = ({ accessToken, canMutate: allowed, isViewOnly }: ModelCommandAccess) =>
  Boolean(accessToken) && allowed && !isViewOnly;

const invalidateModels = (queryClient: QueryClient) => queryClient.invalidateQueries({ queryKey: ["models", "list"] });

const invalidateCredentials = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: ["credentials", "list"] });

export async function createModelsCommand({
  access,
  models,
  queryClient,
}: {
  access: ModelCommandAccess;
  models: Model[];
  queryClient: QueryClient;
}): Promise<ModelCommandResult<{ count: number }>> {
  if (!canMutate(access)) return { status: "blocked" };

  for (const model of models) {
    await modelCreateCall(access.accessToken!, model, { showSuccessToast: false });
  }
  await invalidateModels(queryClient);
  return { status: "success", value: { count: models.length } };
}

export async function updateModelCommand({
  access,
  modelId,
  patch,
  queryClient,
}: {
  access: ModelCommandAccess;
  modelId: string;
  patch: Record<string, unknown>;
  queryClient: QueryClient;
}): Promise<ModelCommandResult<null>> {
  if (!canMutate(access)) return { status: "blocked" };

  await modelPatchUpdateCall(access.accessToken!, patch, modelId);
  await invalidateModels(queryClient);
  return { status: "success", value: null };
}

export async function loadModelCredentialCommand({
  access,
  modelId,
}: {
  access: ModelCommandAccess;
  modelId: string;
}): Promise<ModelCommandResult<CredentialItem>> {
  if (!canMutate(access)) return { status: "blocked" };

  const credential = await credentialGetCall(access.accessToken!, null, modelId);
  return { status: "success", value: credential as CredentialItem };
}

export async function reuseModelCredentialCommand({
  access,
  modelId,
  credentialName,
  provider,
  queryClient,
}: {
  access: ModelCommandAccess;
  modelId: string;
  credentialName: string;
  provider: string | null | undefined;
  queryClient: QueryClient;
}): Promise<ModelCommandResult<null>> {
  if (!canMutate(access)) return { status: "blocked" };

  await credentialCreateCall(access.accessToken!, {
    credential_name: credentialName,
    model_id: modelId,
    credential_info: { custom_llm_provider: provider },
  });
  await Promise.all([invalidateCredentials(queryClient), invalidateModels(queryClient)]);
  return { status: "success", value: null };
}
