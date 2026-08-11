import React from "react";
import { Form, Input, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const AwsSigV4Fields: React.FC = () => {
  const { t } = useTranslation("gateway");
  return (
    <>
      <p className="text-sm text-gray-500 mb-2">
        {t("mcpServers.edit.awsDescription")}{" "}
        <a
          href="https://docs.litellm.ai/docs/mcp_aws_sigv4"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          {t("mcpServers.edit.docs")}
        </a>
      </p>
      <Form.Item
        label={
          <span className="text-sm font-medium text-gray-700 flex items-center">
            {t("mcpServers.edit.awsRegion")}
            <Tooltip title={t("mcpServers.edit.awsRegionHint")}>
              <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
            </Tooltip>
          </span>
        }
        name={["credentials", "aws_region_name"]}
        rules={[{ required: true, message: t("mcpServers.forms.aws.regionRequired") }]}
      >
        <Input
          placeholder="us-east-1"
          className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="text-sm font-medium text-gray-700 flex items-center">
            {t("mcpServers.edit.awsService")}
            <Tooltip title={t("mcpServers.edit.awsServiceHint")}>
              <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
            </Tooltip>
          </span>
        }
        name={["credentials", "aws_service_name"]}
      >
        <Input
          placeholder="bedrock-agentcore"
          className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="text-sm font-medium text-gray-700 flex items-center">
            {t("mcpServers.edit.awsAccessKey")}
            <Tooltip title={t("mcpServers.edit.awsAccessKeyHint")}>
              <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
            </Tooltip>
          </span>
        }
        name={["credentials", "aws_access_key_id"]}
        dependencies={[["credentials", "aws_secret_access_key"]]}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              const secretKey = getFieldValue(["credentials", "aws_secret_access_key"]);
              if (secretKey && !value) {
                return Promise.reject(new Error(t("mcpServers.forms.aws.accessKeyRequired")));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input.Password
          placeholder={t("mcpServers.forms.aws.accessKeyPlaceholder")}
          className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="text-sm font-medium text-gray-700 flex items-center">
            {t("mcpServers.edit.awsSecret")}
            <Tooltip title={t("mcpServers.edit.awsSecretHint")}>
              <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
            </Tooltip>
          </span>
        }
        name={["credentials", "aws_secret_access_key"]}
        dependencies={[["credentials", "aws_access_key_id"]]}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              const accessKeyId = getFieldValue(["credentials", "aws_access_key_id"]);
              if (accessKeyId && !value) {
                return Promise.reject(new Error(t("mcpServers.forms.aws.secretRequired")));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input.Password
          placeholder={t("mcpServers.forms.aws.secretPlaceholder")}
          className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="text-sm font-medium text-gray-700 flex items-center">
            {t("mcpServers.edit.awsSessionToken")}
            <Tooltip title={t("mcpServers.edit.awsSessionTokenHint")}>
              <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
            </Tooltip>
          </span>
        }
        name={["credentials", "aws_session_token"]}
      >
        <Input.Password
          placeholder={t("mcpServers.forms.aws.sessionTokenPlaceholder")}
          className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="text-sm font-medium text-gray-700 flex items-center">
            {t("mcpServers.edit.awsRoleArn")}
            <Tooltip title={t("mcpServers.edit.awsRoleArnHint")}>
              <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
            </Tooltip>
          </span>
        }
        name={["credentials", "aws_role_name"]}
      >
        <Input
          placeholder={t("mcpServers.forms.aws.rolePlaceholder")}
          className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="text-sm font-medium text-gray-700 flex items-center">
            {t("mcpServers.edit.awsSessionName")}
            <Tooltip title={t("mcpServers.edit.awsSessionNameHint")}>
              <InfoCircleOutlined className="ml-2 text-blue-400 hover:text-blue-600 cursor-help" />
            </Tooltip>
          </span>
        }
        name={["credentials", "aws_session_name"]}
      >
        <Input
          placeholder={t("mcpServers.forms.aws.sessionNamePlaceholder")}
          className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </Form.Item>
    </>
  );
};

export default AwsSigV4Fields;
