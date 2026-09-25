import {
  buildModelCreatePayloads,
  type ModelCreateMessages,
  type ModelCreateValues,
} from "@/features/models-and-endpoints/modelFormContract";
import { createModelsCommand } from "@/features/models-and-endpoints/modelCommands";
import { toast } from "@/lib/toast";
import type { Model } from "../networking";
import type { QueryClient } from "@tanstack/react-query";

const legacyMessages: ModelCreateMessages = {
  jsonStringExpected: (fieldName) => `Failed to parse ${fieldName}: expected JSON text`,
  jsonObjectExpected: (fieldName) => `Failed to parse ${fieldName}: expected a JSON object`,
  providerRequired: "A provider is required for wildcard models",
  modelRequired: "Please select at least one model",
  modelNamesRequired: "Model names are required",
  extraParamsField: "Nexoplane Extra Params",
  modelInfoField: "Model Info",
};

export const prepareModelAddRequest = async (formValues: Record<string, unknown>, _accessToken: string, _form: unknown) => {
  try {
    return buildModelCreatePayloads(formValues as ModelCreateValues, legacyMessages).map((model) => ({
      litellmParamsObj: model.litellm_params,
      modelInfoObj: model.model_info,
      modelName: model.model_name,
    }));
  } catch (error) {
    toast.fromError(`Failed to create model: ${String(error)}`);
    return undefined;
  }
};

export const handleAddModelSubmit = async (
  values: Record<string, unknown>,
  accessToken: string,
  form: { resetFields: () => void },
  commandContext: { canMutate: boolean; isViewOnly: boolean; queryClient: QueryClient; onSuccess?: () => void },
) => {
  try {
    const deployments = await prepareModelAddRequest(values, accessToken, form);
    if (!deployments?.length) return false;
    const models: Model[] = deployments.map((deployment) => ({
        model_name: deployment.modelName,
        litellm_params: deployment.litellmParamsObj,
        model_info: deployment.modelInfoObj,
    }));
    const result = await createModelsCommand({
      access: { accessToken, canMutate: commandContext.canMutate, isViewOnly: commandContext.isViewOnly },
      models,
      queryClient: commandContext.queryClient,
    });
    if (result.status === "blocked") return false;
    for (const model of models) {
      toast.success(`Model ${model.model_name} created successfully`);
    }
    commandContext.onSuccess?.();
    form.resetFields();
    return true;
  } catch (error) {
    toast.fromError(`Failed to add model: ${String(error)}`);
    return false;
  }
};
