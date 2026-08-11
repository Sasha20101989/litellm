import React, { useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import MessageManager from "@/components/molecules/message_manager";
import { Button } from "@tremor/react";
import { registerClaudeCodePlugin } from "@/components/networking";
import {
  validatePluginName,
  isValidSemanticVersion,
  isValidEmail,
  isValidUrl,
  parseKeywords,
  parseSkillSource,
  isValidSubPath,
  SkillSourcePreview,
} from "@/components/claude_code_plugins/helpers";
import { PluginAuthor, PluginSource, SkillRegisterRequest } from "@/components/claude_code_plugins/types";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;
const { Option } = Select;

interface AddPluginFormProps {
  visible: boolean;
  onClose: () => void;
  accessToken: string | null;
  onSuccess: () => void;
}

interface AddPluginFormValues {
  name: string;
  skillUrl?: string;
  subPath?: string;
  version?: string;
  description?: string;
  authorName?: string;
  authorEmail?: string;
  homepage?: string;
  category?: string;
  keywords?: string;
  domain?: string;
  namespace?: string;
}

const buildAuthor = (values: AddPluginFormValues): PluginAuthor | undefined => {
  const name = values.authorName?.trim();
  const email = values.authorEmail?.trim();
  if (!name) {
    return undefined;
  }
  return email ? { name, email } : { name };
};

const buildRegisterRequest = (values: AddPluginFormValues, source: PluginSource): SkillRegisterRequest => {
  const author = buildAuthor(values);
  return {
    name: values.name.trim(),
    source,
    ...(values.version ? { version: values.version.trim() } : {}),
    ...(values.description ? { description: values.description.trim() } : {}),
    ...(author ? { author } : {}),
    ...(values.homepage ? { homepage: values.homepage.trim() } : {}),
    ...(values.category ? { category: values.category } : {}),
    ...(values.keywords ? { keywords: parseKeywords(values.keywords) } : {}),
    ...(values.domain ? { domain: values.domain.trim() } : {}),
    ...(values.namespace ? { namespace: values.namespace.trim() } : {}),
  };
};

const PREDEFINED_CATEGORIES = [
  { value: "Development", translationKey: "development" },
  { value: "Productivity", translationKey: "productivity" },
  { value: "Learning", translationKey: "learning" },
  { value: "Security", translationKey: "security" },
  { value: "Data & Analytics", translationKey: "data" },
  { value: "Integration", translationKey: "integration" },
  { value: "Testing", translationKey: "testing" },
  { value: "Documentation", translationKey: "documentation" },
];

const AddPluginForm: React.FC<AddPluginFormProps> = ({ visible, onClose, accessToken, onSuccess }) => {
  const { t } = useTranslation("gateway");
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlPreview, setUrlPreview] = useState<SkillSourcePreview | null>(null);
  const [urlEncodesSubdir, setUrlEncodesSubdir] = useState(false);

  const recomputePreview = (skillUrl: string, subPath: string) => {
    const encodesSubdir = parseSkillSource(skillUrl)?.parsed.source === "git-subdir";
    setUrlEncodesSubdir(encodesSubdir);
    if (encodesSubdir && form.getFieldValue("subPath")) {
      form.setFieldsValue({ subPath: "" });
    }
    const preview = parseSkillSource(skillUrl, encodesSubdir ? undefined : subPath);
    setUrlPreview(preview);
    if (preview && !form.getFieldValue("name")) {
      form.setFieldsValue({ name: preview.suggestedName });
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    recomputePreview(e.target.value, form.getFieldValue("subPath") ?? "");
  };

  const handleSubPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    recomputePreview(form.getFieldValue("skillUrl") ?? "", e.target.value);
  };

  const handleSubmit = async (values: AddPluginFormValues) => {
    if (!accessToken) {
      MessageManager.error(t("skills.form.noToken"));
      return;
    }

    if (!urlPreview) {
      MessageManager.error(t("skills.form.validRepository"));
      return;
    }

    if (!validatePluginName(values.name)) {
      MessageManager.error(t("skills.form.kebabError"));
      return;
    }

    if (values.version && !isValidSemanticVersion(values.version)) {
      MessageManager.error(t("skills.form.versionError"));
      return;
    }

    if (values.authorEmail && !isValidEmail(values.authorEmail)) {
      MessageManager.error(t("skills.form.emailError"));
      return;
    }

    if (values.homepage && !isValidUrl(values.homepage)) {
      MessageManager.error(t("skills.form.homepageError"));
      return;
    }

    setIsSubmitting(true);
    try {
      await registerClaudeCodePlugin(accessToken, buildRegisterRequest(values, urlPreview.parsed));
      MessageManager.success(t("skills.form.success"));
      form.resetFields();
      setUrlPreview(null);
      setUrlEncodesSubdir(false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error registering skill:", error);
      MessageManager.error(error instanceof Error && error.message ? error.message : t("skills.form.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setUrlPreview(null);
    setUrlEncodesSubdir(false);
    onClose();
  };

  return (
    <Modal
      title={t("skills.form.title")}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      className="top-8"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
        {/* Smart URL Input */}
        <Form.Item
          label={t("skills.form.repository")}
          name="skillUrl"
          rules={[{ required: true, message: t("skills.form.repositoryRequired") }]}
          tooltip={t("skills.form.repositoryTooltip")}
        >
          <Input
            placeholder="https://github.com/org/repo or https://gitlab.com/org/repo"
            className="rounded-lg"
            onChange={handleUrlChange}
          />
        </Form.Item>

        {/* Optional subfolder for monorepos */}
        <Form.Item
          label={t("skills.form.subfolder")}
          name="subPath"
          rules={[
            {
              validator: (_, value) =>
                !value || isValidSubPath(value)
                  ? Promise.resolve()
                  : Promise.reject(new Error(t("skills.form.subfolderError"))),
            },
          ]}
          tooltip={t("skills.form.subfolderTooltip")}
          extra={urlEncodesSubdir ? t("skills.form.subfolderEncoded") : undefined}
        >
          <Input
            placeholder="plugins/my-skill"
            className="rounded-lg"
            onChange={handleSubPathChange}
            disabled={urlEncodesSubdir}
          />
        </Form.Item>

        {/* Parsed preview */}
        {urlPreview && (
          <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            {t("skills.form.detected", { source: urlPreview.label })}
          </div>
        )}

        {/* Skill Name */}
        <Form.Item
          label={t("skills.form.name")}
          name="name"
          rules={[
            { required: true, message: t("skills.form.nameRequired") },
            {
              pattern: /^[a-z0-9-]+$/,
              message: t("skills.form.namePattern"),
            },
          ]}
          tooltip={t("skills.form.nameTooltip")}
        >
          <Input placeholder="my-skill" className="rounded-lg" />
        </Form.Item>

        {/* Domain and Namespace — side by side */}
        <div className="flex gap-4">
          <Form.Item
            label={t("skills.form.domain")}
            name="domain"
            tooltip={t("skills.form.domainTooltip")}
            className="flex-1"
          >
            <Input placeholder={t("skills.form.categories.productivity")} className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label={t("skills.form.namespace")}
            name="namespace"
            tooltip={t("skills.form.namespaceTooltip")}
            className="flex-1"
          >
            <Input placeholder="workflows" className="rounded-lg" />
          </Form.Item>
        </div>

        {/* Description */}
        <Form.Item
          label={t("skills.form.description")}
          name="description"
          tooltip={t("skills.form.descriptionTooltip")}
        >
          <TextArea
            rows={3}
            placeholder={t("skills.form.descriptionPlaceholder")}
            maxLength={500}
            className="rounded-lg"
          />
        </Form.Item>

        {/* Category */}
        <Form.Item label={t("skills.form.category")} name="category" tooltip={t("skills.form.categoryTooltip")}>
          <Select
            placeholder={t("skills.form.categoryPlaceholder")}
            allowClear
            showSearch
            optionFilterProp="children"
            className="rounded-lg"
          >
            {PREDEFINED_CATEGORIES.map((category) => (
              <Option key={category.value} value={category.value}>
                {t(`skills.form.categories.${category.translationKey}`)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Keywords */}
        <Form.Item label={t("skills.form.keywords")} name="keywords" tooltip={t("skills.form.keywordsTooltip")}>
          <Input placeholder="search, web, api" className="rounded-lg" />
        </Form.Item>

        {/* Version */}
        <Form.Item label={t("skills.form.version")} name="version" tooltip={t("skills.form.versionTooltip")}>
          <Input placeholder="1.0.0" className="rounded-lg" />
        </Form.Item>

        {/* Author Name */}
        <Form.Item label={t("skills.form.author")} name="authorName" tooltip={t("skills.form.authorTooltip")}>
          <Input placeholder={t("skills.form.authorPlaceholder")} className="rounded-lg" />
        </Form.Item>

        {/* Author Email */}
        <Form.Item
          label={t("skills.form.authorEmail")}
          name="authorEmail"
          rules={[{ type: "email", message: t("skills.form.authorEmailRequired") }]}
          tooltip={t("skills.form.authorEmailTooltip")}
        >
          <Input type="email" placeholder="author@example.com" className="rounded-lg" />
        </Form.Item>

        {/* Submit Buttons */}
        <Form.Item className="mb-0 mt-6">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
              {t("skills.cancel")}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? t("skills.form.adding") : t("skills.form.submit")}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPluginForm;
