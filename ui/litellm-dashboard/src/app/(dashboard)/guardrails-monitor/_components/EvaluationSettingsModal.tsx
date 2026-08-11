import { CloseOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Select, Input } from "antd";
import React, { useEffect, useState } from "react";
import { fetchAvailableModels, type ModelGroup } from "@/components/llm_calls/fetch_models";
import { useTranslation } from "react-i18next";

const DEFAULT_SCHEMA = `{
  "verdict": "correct" | "false_positive" | "false_negative",
  "confidence": 0.0,
  "justification": "string",
  "risk_category": "string",
  "suggested_action": "keep" | "adjust threshold" | "add allowlist"
}
`;

export interface EvaluationSettingsModalProps {
  open: boolean;
  onClose: () => void;
  guardrailName?: string;
  accessToken: string | null;
  onRunEvaluation?: (settings: { prompt: string; schema: string; model: string }) => void;
}

export function EvaluationSettingsModal({
  open,
  onClose,
  guardrailName,
  accessToken,
  onRunEvaluation,
}: EvaluationSettingsModalProps) {
  const { t } = useTranslation("guardrails");
  const defaultPrompt = t("monitor.evaluation.defaultPrompt");
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [schema, setSchema] = useState(DEFAULT_SCHEMA);
  const [model, setModel] = useState<string | null>(null);
  const [modelOptions, setModelOptions] = useState<ModelGroup[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (!open || !accessToken) {
      setModelOptions([]);
      return;
    }
    let cancelled = false;
    setLoadingModels(true);
    fetchAvailableModels(accessToken)
      .then((list) => {
        if (!cancelled) setModelOptions(list);
      })
      .catch(() => {
        if (!cancelled) setModelOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingModels(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, accessToken]);

  const handleResetPrompt = () => setPrompt(defaultPrompt);
  const handleRun = () => {
    if (model) {
      onRunEvaluation?.({ prompt, schema, model });
      onClose();
    }
  };

  const modelSelectOptions = modelOptions.map((m) => ({
    value: m.model_group,
    label: m.model_group,
  }));

  return (
    <Modal
      title={t("monitor.evaluation.title")}
      open={open}
      onCancel={onClose}
      width={640}
      footer={null}
      closeIcon={<CloseOutlined />}
      destroyOnClose
    >
      <p className="text-sm text-gray-500 mb-4">
        {guardrailName
          ? t("monitor.evaluation.forGuardrail", { name: guardrailName })
          : t("monitor.evaluation.forLogs")}
      </p>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">{t("monitor.evaluation.prompt")}</label>
            <button type="button" onClick={handleResetPrompt} className="text-xs text-indigo-600 hover:text-indigo-700">
              {t("monitor.evaluation.reset")}
            </button>
          </div>
          <Input.TextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            {t("monitor.evaluation.promptHelp")}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t("monitor.evaluation.responseSchema")}
          </label>
          <p className="text-xs text-gray-400 mb-1">response_format: json_schema</p>
          <Input.TextArea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            rows={6}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("monitor.evaluation.model")}</label>
          <Select
            placeholder={
              loadingModels ? t("monitor.evaluation.loadingModels") : t("monitor.evaluation.selectModel")
            }
            value={model ?? undefined}
            onChange={setModel}
            options={modelSelectOptions}
            style={{ width: "100%" }}
            showSearch
            optionFilterProp="label"
            loading={loadingModels}
            notFoundContent={!accessToken ? t("monitor.evaluation.signIn") : t("monitor.evaluation.noModels")}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <Button onClick={onClose}>{t("monitor.evaluation.cancel")}</Button>
        <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleRun} disabled={!model}>
          {t("monitor.evaluation.run")}
        </Button>
      </div>
    </Modal>
  );
}
