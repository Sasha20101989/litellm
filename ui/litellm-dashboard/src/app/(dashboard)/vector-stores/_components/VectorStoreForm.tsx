import React, { useState, useEffect } from "react";
import { TextInput, Button as TremorButton } from "@tremor/react";
import { Modal, Form, Select, Tooltip, Input, Alert } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { CredentialItem, vectorStoreCreateCall } from "@/components/networking";
import {
  VectorStoreProviders,
  vectorStoreProviderLogoMap,
  vectorStoreProviderMap,
  getProviderSpecificFields,
  VectorStoreFieldConfig,
} from "@/components/vector_store_providers";
import { Logo } from "@/components/molecules/logo/Logo";
import { fetchAvailableModels, ModelGroup } from "@/components/llm_calls/fetch_models";
import NotificationsManager from "@/components/molecules/notifications_manager";
import { useTranslation } from "react-i18next";

interface VectorStoreFormProps {
  isVisible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  accessToken: string | null;
  credentials: CredentialItem[];
}

const VectorStoreForm: React.FC<VectorStoreFormProps> = ({
  isVisible,
  onCancel,
  onSuccess,
  accessToken,
  credentials,
}) => {
  const { t } = useTranslation("gateway");
  const [form] = Form.useForm();
  const [metadataJson, setMetadataJson] = useState("{}");
  const [selectedProvider, setSelectedProvider] = useState("bedrock");
  const [modelInfo, setModelInfo] = useState<ModelGroup[]>([]);
  const vertexEngineId = Form.useWatch("vertex_engine_id", form);

  const localizeProviderField = (field: VectorStoreFieldConfig, property: "label" | "tooltip" | "placeholder") => {
    const fallback = field[property];
    if (!fallback) return undefined;
    const providerKey = selectedProvider.replaceAll("/", "_");
    return t(`vectorStores.providerFields.${providerKey}.${field.name}.${property}`, { defaultValue: fallback });
  };

  useEffect(() => {
    if (!accessToken) return;

    const loadModels = async () => {
      try {
        const uniqueModels = await fetchAvailableModels(accessToken);
        if (uniqueModels.length > 0) {
          setModelInfo(uniqueModels);
        }
      } catch (error) {
        console.error("Error fetching model info:", error);
      }
    };

    loadModels();
  }, [accessToken]);

  const handleCreate = async (formValues: any) => {
    if (!accessToken) return;
    try {
      // Parse metadata JSON
      let metadata = {};
      try {
        metadata = metadataJson.trim() ? JSON.parse(metadataJson) : {};
      } catch (e) {
        NotificationsManager.fromBackend(t("vectorStores.form.invalidMetadata"));
        return;
      }

      // Prepare the payload with provider-specific fields
      const payload: any = {
        vector_store_id: formValues.vector_store_id,
        custom_llm_provider: formValues.custom_llm_provider,
        vector_store_name: formValues.vector_store_name,
        vector_store_description: formValues.vector_store_description,
        vector_store_metadata: metadata,
        litellm_credential_name: formValues.litellm_credential_name,
      };

      // pass all provider fields as litellm params dict
      const providerFields = getProviderSpecificFields(formValues.custom_llm_provider);
      const litellmParams = providerFields.reduce(
        (acc, field) => {
          // Special handling for Milvus: rename embedding_model to litellm_embedding_model
          if (formValues.custom_llm_provider === "milvus" && field.name === "embedding_model") {
            acc["litellm_embedding_model"] = formValues[field.name];
          } else {
            acc[field.name] = formValues[field.name];
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      payload["litellm_params"] = litellmParams;

      await vectorStoreCreateCall(accessToken, payload);
      NotificationsManager.success(t("vectorStores.form.created"));
      form.resetFields();
      setMetadataJson("{}");
      onSuccess();
    } catch (error) {
      console.error("Error creating vector store:", error);
      NotificationsManager.fromBackend(t("vectorStores.form.createFailed", { error: String(error) }));
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setMetadataJson("{}");
    setSelectedProvider("bedrock");
    onCancel();
  };

  return (
    <Modal title={t("vectorStores.form.title")} open={isVisible} width={1000} footer={null} onCancel={handleCancel}>
      <Form form={form} onFinish={handleCreate} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} labelAlign="left">
        <Form.Item
          label={
            <span>
              {t("vectorStores.form.provider")}{" "}
              <Tooltip title={t("vectorStores.form.providerTooltip")}>
                <InfoCircleOutlined style={{ marginLeft: "4px" }} />
              </Tooltip>
            </span>
          }
          name="custom_llm_provider"
          rules={[{ required: true, message: t("vectorStores.form.providerRequired") }]}
          initialValue="bedrock"
        >
          <Select onChange={(value) => setSelectedProvider(value)}>
            {Object.entries(VectorStoreProviders).map(([providerEnum, providerDisplayName]) => {
              return (
                <Select.Option key={providerEnum} value={vectorStoreProviderMap[providerEnum]}>
                  <div className="flex items-center space-x-2">
                    <Logo
                      src={vectorStoreProviderLogoMap[providerDisplayName]}
                      label={providerDisplayName}
                      className="w-5 h-5"
                    />
                    <span>{providerDisplayName}</span>
                  </div>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

        {/* PG Vector Setup Instructions */}
        {selectedProvider === "pg_vector" && (
          <Alert
            message={t("vectorStores.form.pgVector.title")}
            description={
              <div>
                <p>{t("vectorStores.form.pgVector.intro")}</p>
                <ol style={{ marginLeft: "16px", marginTop: "8px" }}>
                  <li>
                    {t("vectorStores.form.pgVector.deploy")}{" "}
                    <a href="https://github.com/BerriAI/litellm-pgvector" target="_blank" rel="noopener noreferrer">
                      https://github.com/BerriAI/litellm-pgvector
                    </a>
                  </li>
                  <li>{t("vectorStores.form.pgVector.configure")}</li>
                  <li>{t("vectorStores.form.pgVector.start")}</li>
                  <li>{t("vectorStores.form.pgVector.enter")}</li>
                </ol>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}

        {/* Vertex RAG Engine Setup Instructions */}
        {selectedProvider === "vertex_rag_engine" && (
          <Alert
            message={t("vectorStores.form.vertexRag.title")}
            description={
              <div>
                <p>{t("vectorStores.form.vertexRag.intro")}</p>
                <p style={{ marginTop: "4px", fontStyle: "italic" }}>{t("vectorStores.form.vertexRag.note")}</p>
                <ol style={{ marginLeft: "16px", marginTop: "8px" }}>
                  <li>
                    {t("vectorStores.form.vertexRag.setup")}{" "}
                    <a
                      href="https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-overview"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("vectorStores.form.vertexRag.guide")}
                    </a>
                  </li>
                  <li>{t("vectorStores.form.vertexRag.createCorpus")}</li>
                  <li>{t("vectorStores.form.vertexRag.noteCorpus")}</li>
                  <li>{t("vectorStores.form.vertexRag.enterCorpus")}</li>
                </ol>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}

        {/* Vertex AI Search Setup Instructions */}
        {selectedProvider === "vertex_ai/search_api" && (
          <Alert
            message={t("vectorStores.form.vertexSearch.title")}
            description={
              <div>
                <p>{t("vectorStores.form.vertexSearch.intro")}</p>
                <p style={{ marginTop: "4px", fontStyle: "italic" }}>{t("vectorStores.form.vertexSearch.note")}</p>
                <ol style={{ marginLeft: "16px", marginTop: "8px" }}>
                  <li>
                    {t("vectorStores.form.vertexSearch.enable")}{" "}
                    <a
                      href="https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "underline" }}
                    >
                      {t("vectorStores.form.vertexSearch.guide")}
                    </a>
                  </li>
                  <li>{t("vectorStores.form.vertexSearch.location")}</li>
                  <li>{t("vectorStores.form.vertexSearch.dataStore")}</li>
                  <li>{t("vectorStores.form.vertexSearch.engine")}</li>
                </ol>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}

        <Form.Item
          label={
            <span>
              {t("vectorStores.form.id")}{" "}
              <Tooltip title={t("vectorStores.form.idTooltip")}>
                <InfoCircleOutlined style={{ marginLeft: "4px" }} />
              </Tooltip>
            </span>
          }
          name="vector_store_id"
          rules={[{ required: true, message: t("vectorStores.form.idRequired") }]}
        >
          <TextInput
            placeholder={
              selectedProvider === "vertex_rag_engine"
                ? t("vectorStores.form.corpusPlaceholder")
                : selectedProvider === "vertex_ai/search_api"
                  ? vertexEngineId
                    ? t("vectorStores.form.localIdPlaceholder")
                    : t("vectorStores.form.dataStorePlaceholder")
                  : t("vectorStores.form.idPlaceholder")
            }
          />
        </Form.Item>

        {/* Provider-specific fields */}
        {getProviderSpecificFields(selectedProvider).map((field: VectorStoreFieldConfig) => {
          if (field.type === "select") {
            const selectOptions =
              field.options ??
              modelInfo
                .filter((option: ModelGroup) => option.mode === "embedding" || option.mode === null)
                .map((option: ModelGroup) => ({
                  value: option.model_group,
                  label: option.model_group,
                }));

            return (
              <Form.Item
                key={field.name}
                label={
                  <span>
                    {localizeProviderField(field, "label")}{" "}
                    <Tooltip title={localizeProviderField(field, "tooltip")}>
                      <InfoCircleOutlined style={{ marginLeft: "4px" }} />
                    </Tooltip>
                  </span>
                }
                name={field.name}
                initialValue={field.initialValue}
                rules={
                  field.required
                    ? [
                        {
                          required: true,
                          message: t("vectorStores.form.selectRequired", {
                            field: localizeProviderField(field, "label") || field.label,
                          }),
                        },
                      ]
                    : []
                }
              >
                <Select
                  placeholder={localizeProviderField(field, "placeholder")}
                  showSearch={true}
                  filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                  options={selectOptions}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            );
          }

          return (
            <Form.Item
              key={field.name}
              label={
                <span>
                  {localizeProviderField(field, "label")}{" "}
                  <Tooltip title={localizeProviderField(field, "tooltip")}>
                    <InfoCircleOutlined style={{ marginLeft: "4px" }} />
                  </Tooltip>
                </span>
              }
              name={field.name}
              rules={
                field.required
                  ? [
                      {
                        required: true,
                        message: t("vectorStores.form.inputRequired", {
                          field: localizeProviderField(field, "label") || field.label,
                        }),
                      },
                    ]
                  : []
              }
            >
              <TextInput type={field.type || "text"} placeholder={localizeProviderField(field, "placeholder")} />
            </Form.Item>
          );
        })}

        <Form.Item
          label={
            <span>
              {t("vectorStores.form.name")}{" "}
              <Tooltip title={t("vectorStores.form.nameTooltip")}>
                <InfoCircleOutlined style={{ marginLeft: "4px" }} />
              </Tooltip>
            </span>
          }
          name="vector_store_name"
        >
          <TextInput />
        </Form.Item>

        <Form.Item label={t("vectorStores.form.description")} name="vector_store_description">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={
            <span>
              {t("vectorStores.form.credentials")}{" "}
              <Tooltip title={t("vectorStores.form.credentialsTooltip")}>
                <InfoCircleOutlined style={{ marginLeft: "4px" }} />
              </Tooltip>
            </span>
          }
          name="litellm_credential_name"
        >
          <Select
            showSearch
            placeholder={t("vectorStores.form.credentialsPlaceholder")}
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            options={[
              { value: null, label: t("vectorStores.form.none") },
              ...credentials.map((credential) => ({
                value: credential.credential_name,
                label: credential.credential_name,
              })),
            ]}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label={
            <span>
              {t("vectorStores.form.metadata")}{" "}
              <Tooltip title={t("vectorStores.form.metadataTooltip")}>
                <InfoCircleOutlined style={{ marginLeft: "4px" }} />
              </Tooltip>
            </span>
          }
        >
          <Input.TextArea
            rows={4}
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            placeholder='{"key": "value"}'
          />
        </Form.Item>

        <div className="flex justify-end space-x-3">
          <TremorButton onClick={handleCancel} variant="secondary">
            {t("vectorStores.form.cancel")}
          </TremorButton>
          <TremorButton variant="primary" type="submit">
            {t("vectorStores.form.submit")}
          </TremorButton>
        </div>
      </Form>
    </Modal>
  );
};

export default VectorStoreForm;
