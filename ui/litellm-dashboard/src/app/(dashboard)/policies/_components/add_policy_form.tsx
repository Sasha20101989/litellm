import React, { useState, useEffect } from "react";
import { Form, Select, Modal, Divider, Typography, Tag, Alert, Radio } from "antd";
import { Button, TextInput, Textarea } from "@tremor/react";
import { Policy, PolicyCreateRequest, PolicyUpdateRequest } from "@/components/policies/types";
import { Guardrail } from "@/components/guardrails/types";
import { getResolvedGuardrails, modelAvailableCall } from "@/components/networking";
import NotificationsManager from "@/components/molecules/notifications_manager";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

interface AddPolicyFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenFlowBuilder: () => void;
  accessToken: string | null;
  editingPolicy?: Policy | null;
  existingPolicies: Policy[];
  availableGuardrails: Guardrail[];
  createPolicy: (accessToken: string, policyData: any) => Promise<any>;
  updatePolicy: (accessToken: string, policyId: string, policyData: any) => Promise<any>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mode Picker (Step 1) - shown first when creating a new policy
// ─────────────────────────────────────────────────────────────────────────────

interface ModePicker {
  selected: "simple" | "flow_builder";
  onSelect: (mode: "simple" | "flow_builder") => void;
}

const ModePicker: React.FC<ModePicker> = ({ selected, onSelect }) => {
  const { t } = useTranslation("gateway");
  return (
    <div className="flex gap-4" style={{ padding: "8px 0" }}>
      {/* Simple Mode Card */}
      <div
        onClick={() => onSelect("simple")}
        style={{
          flex: 1,
          padding: "24px 20px",
          border: `2px solid ${selected === "simple" ? "#4f46e5" : "#e5e7eb"}`,
          borderRadius: 12,
          cursor: "pointer",
          backgroundColor: selected === "simple" ? "#eef2ff" : "#fff",
          transition: "all 0.15s ease",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: selected === "simple" ? "#e0e7ff" : "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={selected === "simple" ? "#4f46e5" : "#6b7280"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8 7h8M8 12h8M8 17h5" />
          </svg>
        </div>
        <Text strong style={{ fontSize: 15, display: "block", marginBottom: 4 }}>
          {t("policies.policyForm.simpleMode")}
        </Text>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {t("policies.policyForm.simpleDescription")}
        </Text>
      </div>

      {/* Flow Builder Card */}
      <div
        onClick={() => onSelect("flow_builder")}
        style={{
          flex: 1,
          padding: "24px 20px",
          border: `2px solid ${selected === "flow_builder" ? "#4f46e5" : "#e5e7eb"}`,
          borderRadius: 12,
          cursor: "pointer",
          backgroundColor: selected === "flow_builder" ? "#eef2ff" : "#fff",
          transition: "all 0.15s ease",
          position: "relative",
        }}
      >
        <Tag
          color="purple"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: 10,
            fontWeight: 600,
            margin: 0,
          }}
        >
          {t("policies.policyForm.new")}
        </Tag>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: selected === "flow_builder" ? "#e0e7ff" : "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={selected === "flow_builder" ? "#4f46e5" : "#6b7280"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <Text strong style={{ fontSize: 15, display: "block", marginBottom: 4 }}>
          {t("policies.policyForm.flowBuilder")}
        </Text>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {t("policies.policyForm.flowDescription")}
        </Text>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const AddPolicyForm: React.FC<AddPolicyFormProps> = ({
  visible,
  onClose,
  onSuccess,
  onOpenFlowBuilder,
  accessToken,
  editingPolicy,
  existingPolicies,
  availableGuardrails,
  createPolicy,
  updatePolicy,
}) => {
  const { t } = useTranslation("gateway");
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedGuardrails, setResolvedGuardrails] = useState<string[]>([]);
  const [modelConditionType, setModelConditionType] = useState<"model" | "regex">("model");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [step, setStep] = useState<"pick_mode" | "simple_form">("pick_mode");
  const [selectedMode, setSelectedMode] = useState<"simple" | "flow_builder">("simple");
  const { userId, userRole } = useAuthorized();

  // Only consider it "editing" if editingPolicy has a policy_id (real existing policy)
  const isEditing = !!editingPolicy?.policy_id;

  useEffect(() => {
    if (visible && editingPolicy) {
      const modelCondition = editingPolicy.condition?.model;
      const isRegex = modelCondition && /[.*+?^${}()|[\]\\]/.test(modelCondition);
      setModelConditionType(isRegex ? "regex" : "model");

      form.setFieldsValue({
        policy_name: editingPolicy.policy_name,
        description: editingPolicy.description,
        inherit: editingPolicy.inherit,
        guardrails_add: editingPolicy.guardrails_add || [],
        guardrails_remove: editingPolicy.guardrails_remove || [],
        model_condition: modelCondition,
      });

      if (editingPolicy.policy_id && accessToken) {
        loadResolvedGuardrails(editingPolicy.policy_id);
      }

      // If editing a pipeline policy, go directly to flow builder
      if (editingPolicy.pipeline) {
        onClose();
        onOpenFlowBuilder();
        return;
      }
      // If editing a simple policy, skip mode picker
      setStep("simple_form");
    } else if (visible) {
      form.resetFields();
      setResolvedGuardrails([]);
      setModelConditionType("model");
      setSelectedMode("simple");
      setStep("pick_mode");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editingPolicy, form]);

  useEffect(() => {
    if (visible && accessToken) {
      loadAvailableModels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, accessToken]);

  const loadAvailableModels = async () => {
    if (!accessToken) return;
    try {
      const response = await modelAvailableCall(accessToken, userId, userRole);
      if (response?.data) {
        const models = response.data.map((m: any) => m.id || m.model_name).filter(Boolean);
        setAvailableModels(models);
      }
    } catch (error) {
      console.error("Failed to load available models:", error);
    }
  };

  const loadResolvedGuardrails = async (policyId: string) => {
    if (!accessToken) return;
    try {
      const data = await getResolvedGuardrails(accessToken, policyId);
      setResolvedGuardrails(data.resolved_guardrails || []);
    } catch (error) {
      console.error("Failed to load resolved guardrails:", error);
    }
  };

  const computeResolvedGuardrails = (): string[] => {
    const values = form.getFieldsValue(true);
    const inheritFrom = values.inherit;
    const guardrailsAdd = values.guardrails_add || [];
    const guardrailsRemove = values.guardrails_remove || [];

    let resolved = new Set<string>();

    if (inheritFrom) {
      const parentPolicy = existingPolicies.find((p) => p.policy_name === inheritFrom);
      if (parentPolicy) {
        const parentResolved = resolveParentGuardrails(parentPolicy);
        parentResolved.forEach((g) => resolved.add(g));
      }
    }

    guardrailsAdd.forEach((g: string) => resolved.add(g));
    guardrailsRemove.forEach((g: string) => resolved.delete(g));

    return Array.from(resolved).sort();
  };

  const resolveParentGuardrails = (policy: Policy): string[] => {
    let resolved = new Set<string>();

    if (policy.inherit) {
      const grandparent = existingPolicies.find((p) => p.policy_name === policy.inherit);
      if (grandparent) {
        resolveParentGuardrails(grandparent).forEach((g) => resolved.add(g));
      }
    }
    if (policy.guardrails_add) {
      policy.guardrails_add.forEach((g) => resolved.add(g));
    }
    if (policy.guardrails_remove) {
      policy.guardrails_remove.forEach((g) => resolved.delete(g));
    }
    return Array.from(resolved);
  };

  const handleFormChange = () => {
    setResolvedGuardrails(computeResolvedGuardrails());
  };

  const resetForm = () => {
    form.resetFields();
  };

  const handleClose = () => {
    resetForm();
    setStep("pick_mode");
    setSelectedMode("simple");
    onClose();
  };

  const handleModeConfirm = () => {
    if (selectedMode === "flow_builder") {
      onClose();
      onOpenFlowBuilder();
    } else {
      setStep("simple_form");
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await form.validateFields();
      const values = form.getFieldsValue(true);

      if (!accessToken) {
        throw new Error(t("policies.policyForm.noToken"));
      }

      const data: PolicyCreateRequest | PolicyUpdateRequest = {
        policy_name: values.policy_name,
        description: values.description || undefined,
        inherit: values.inherit || undefined,
        guardrails_add: values.guardrails_add || [],
        guardrails_remove: values.guardrails_remove || [],
        condition: values.model_condition ? { model: values.model_condition } : undefined,
      };

      if (isEditing && editingPolicy) {
        await updatePolicy(accessToken, editingPolicy.policy_id, data as PolicyUpdateRequest);
        NotificationsManager.success(t("policies.policyForm.updated"));
      } else {
        await createPolicy(accessToken, data as PolicyCreateRequest);
        NotificationsManager.success(t("policies.policyForm.created"));
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save policy:", error);
      NotificationsManager.fromBackend(
        t("policies.policyForm.saveFailed", { error: error instanceof Error ? error.message : String(error) }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const guardrailOptions = availableGuardrails.map((g) => ({
    label: g.guardrail_name || g.guardrail_id,
    value: g.guardrail_name || g.guardrail_id,
  }));

  const policyOptions = existingPolicies
    .filter((p) => !editingPolicy || p.policy_id !== editingPolicy.policy_id)
    .map((p) => ({
      label: p.policy_name,
      value: p.policy_name,
    }));

  // ── Mode Picker Step ──────────────────────────────────────────────────────
  if (step === "pick_mode") {
    return (
      <Modal
        title={t("policies.policyForm.createTitle")}
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={620}
      >
        <ModePicker selected={selectedMode} onSelect={setSelectedMode} />

        {selectedMode === "flow_builder" && (
          <Alert
            message={t("policies.policyForm.flowRedirect")}
            type="info"
            style={{
              marginTop: 16,
              backgroundColor: "#eef2ff",
              border: "1px solid #c7d2fe",
            }}
          />
        )}

        <div className="flex justify-end gap-2" style={{ marginTop: 24 }}>
          <Button variant="secondary" onClick={handleClose}>
            {t("policies.policyForm.cancel")}
          </Button>
          <Button
            onClick={handleModeConfirm}
            style={{
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
            }}
          >
            {selectedMode === "flow_builder"
              ? t("policies.policyForm.continueBuilder")
              : t("policies.policyForm.create")}
          </Button>
        </div>
      </Modal>
    );
  }

  // ── Simple Form Step ──────────────────────────────────────────────────────
  return (
    <Modal
      title={isEditing ? t("policies.policyForm.editTitle") : t("policies.policyForm.createTitle")}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          guardrails_add: [],
          guardrails_remove: [],
        }}
        onValuesChange={handleFormChange}
      >
        <Form.Item
          name="policy_name"
          label={t("policies.policyForm.name")}
          rules={[
            { required: true, message: t("policies.policyForm.nameRequired") },
            {
              pattern: /^[a-zA-Z0-9_-]+$/,
              message: t("policies.policyForm.namePattern"),
            },
          ]}
        >
          <TextInput placeholder={t("policies.policyForm.namePlaceholder")} disabled={isEditing} />
        </Form.Item>

        <Form.Item name="description" label={t("policies.policyForm.description")}>
          <Textarea rows={2} placeholder={t("policies.policyForm.descriptionPlaceholder")} />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>{t("policies.policyForm.inheritance")}</Text>
        </Divider>

        <Form.Item
          name="inherit"
          label={t("policies.policyForm.inheritFrom")}
          tooltip={t("policies.policyForm.inheritTooltip")}
        >
          <Select
            allowClear
            placeholder={t("policies.policyForm.inheritPlaceholder")}
            options={policyOptions}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Divider orientation="left">
          <Text strong>{t("policies.policyForm.guardrails")}</Text>
        </Divider>

        <Form.Item
          name="guardrails_add"
          label={t("policies.policyForm.guardrailsAdd")}
          tooltip={t("policies.policyForm.guardrailsAddTooltip")}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder={t("policies.policyForm.guardrailsAddPlaceholder")}
            options={guardrailOptions}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          name="guardrails_remove"
          label={t("policies.policyForm.guardrailsRemove")}
          tooltip={t("policies.policyForm.guardrailsRemoveTooltip")}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder={t("policies.policyForm.guardrailsRemovePlaceholder")}
            options={guardrailOptions}
            style={{ width: "100%" }}
          />
        </Form.Item>

        {resolvedGuardrails.length > 0 && (
          <Alert
            message={t("policies.policyForm.resolvedGuardrails")}
            description={
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                  {t("policies.policyForm.resolvedDescription")}
                </Text>
                <div className="flex flex-wrap gap-1">
                  {resolvedGuardrails.map((g) => (
                    <Tag key={g} color="blue">
                      {g}
                    </Tag>
                  ))}
                </div>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Divider orientation="left">
          <Text strong>{t("policies.policyForm.conditions")}</Text>
        </Divider>

        <Alert
          message={t("policies.policyForm.modelScope")}
          description={t("policies.policyForm.modelScopeDescription")}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item label={t("policies.policyForm.modelConditionType")}>
          <Radio.Group
            value={modelConditionType}
            onChange={(e) => {
              setModelConditionType(e.target.value);
              form.setFieldValue("model_condition", undefined);
            }}
          >
            <Radio value="model">{t("policies.policyForm.selectModel")}</Radio>
            <Radio value="regex">{t("policies.policyForm.regex")}</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="model_condition"
          label={
            modelConditionType === "model"
              ? t("policies.policyForm.modelOptional")
              : t("policies.policyForm.regexOptional")
          }
          tooltip={
            modelConditionType === "model"
              ? t("policies.policyForm.modelTooltip")
              : t("policies.policyForm.regexTooltip")
          }
        >
          {modelConditionType === "model" ? (
            <Select
              showSearch
              allowClear
              placeholder={t("policies.policyForm.modelPlaceholder")}
              options={availableModels.map((model) => ({
                label: model,
                value: model,
              }))}
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              style={{ width: "100%" }}
            />
          ) : (
            <TextInput placeholder={t("policies.policyForm.regexPlaceholder")} />
          )}
        </Form.Item>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={handleClose}>
            {t("policies.policyForm.cancel")}
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            {isEditing ? t("policies.policyForm.update") : t("policies.policyForm.create")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddPolicyForm;
