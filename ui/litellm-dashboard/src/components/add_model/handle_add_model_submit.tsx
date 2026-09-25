import {
  buildModelCreatePayloads,
  type ModelCreateMessages,
  type ModelCreateValues,
} from "@/features/models-and-endpoints/modelFormContract";
import { toast } from "@/lib/toast";
import { type Model, modelCreateCall } from "../networking";

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
  callback?: () => void,
) => {
  try {
    const deployments = await prepareModelAddRequest(values, accessToken, form);
    if (!deployments?.length) return;
    for (const deployment of deployments) {
      const newModel: Model = {
        model_name: deployment.modelName,
        litellm_params: deployment.litellmParamsObj,
        model_info: deployment.modelInfoObj,
      };
      await modelCreateCall(accessToken, newModel);
    }
    callback?.();
    form.resetFields();
  } catch (error) {
    toast.fromError(`Failed to add model: ${String(error)}`);
  }
};
