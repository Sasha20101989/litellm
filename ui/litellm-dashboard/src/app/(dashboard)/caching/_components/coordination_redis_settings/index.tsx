import React, { useEffect, useMemo, useState } from "react";
import { Button, Form } from "antd";
import NotificationsManager from "@/components/molecules/notifications_manager";
import { StatusBadge } from "@/components/shared/table_cells/status_badge";
import {
  useCoordinationRedisSettings,
  useTestCoordinationRedisConnection,
  useUpdateCoordinationRedisSettings,
} from "@/app/(dashboard)/hooks/coordinationRedis/useCoordinationRedisSettings";
import CoordinationRedisFieldSection from "./CoordinationRedisFieldSection";
import CoordinationRedisTypeSelector from "./CoordinationRedisTypeSelector";
import { CoordinationRedisType } from "./coordinationRedisFields";
import {
  buildCoordinationPayload,
  buildInitialValues,
  configuredSecretFields,
  CoordinationFormValues,
  inferRedisType,
  sourceBadge,
} from "./coordinationRedisUtils";
import { useTranslation } from "react-i18next";

const CoordinationRedisSettings: React.FC = () => {
  const { t } = useTranslation("settings");
  const [form] = Form.useForm<CoordinationFormValues>();
  const [selectedRedisType, setSelectedRedisType] = useState<CoordinationRedisType | null>(null);

  const { data, isLoading, isError } = useCoordinationRedisSettings();
  const updateSettings = useUpdateCoordinationRedisSettings();
  const testConnection = useTestCoordinationRedisConnection();

  const redisType = selectedRedisType ?? inferRedisType(data?.values ?? {});

  useEffect(() => {
    if (data) {
      form.setFieldsValue(buildInitialValues(data.values));
    }
  }, [data, form]);

  useEffect(() => {
    if (isError) {
      NotificationsManager.fromBackend(t("caching.coordination.loadFailed"));
    }
  }, [isError]);

  const validate = async (): Promise<CoordinationFormValues | null> => {
    try {
      return await form.validateFields();
    } catch {
      return null;
    }
  };

  const handleTestConnection = async () => {
    const values = await validate();
    if (values === null) {
      return;
    }

    try {
      const result = await testConnection.mutateAsync(buildCoordinationPayload(redisType, values));
      if (result.status === "healthy") {
        NotificationsManager.success(t("caching.coordination.testSuccess"));
      } else {
        NotificationsManager.fromBackend(
          t("caching.settings.testFailed", { error: result.error ?? t("caching.unknownError") }),
        );
      }
    } catch (error) {
      NotificationsManager.fromBackend(
        t("caching.settings.testFailed", {
          error: error instanceof Error ? error.message : t("caching.unknownError"),
        }),
      );
    }
  };

  const handleSaveChanges = async () => {
    const values = await validate();
    if (values === null) {
      return;
    }

    try {
      await updateSettings.mutateAsync(buildCoordinationPayload(redisType, values));
      NotificationsManager.success(t("caching.coordination.saved"));
    } catch {
      NotificationsManager.fromBackend(t("caching.coordination.updateFailed"));
    }
  };

  const badge = sourceBadge(data?.source);
  const sourceKey = ["coordination_redis", "cache_backend", "environment"].includes(data?.source ?? "")
    ? data!.source!
    : "none";
  const configuredSecrets = useMemo(() => configuredSecretFields(data?.values ?? {}), [data]);

  return (
    <div className="w-full space-y-8 py-2">
      <Form form={form} layout="vertical" requiredMark={false} className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-gray-900">{t("caching.coordination.title")}</h3>
            {!isLoading && (
              <StatusBadge
                tone={badge.tone}
                label={t(`caching.coordination.source.${sourceKey}`, { defaultValue: badge.label })}
                dataTestId="coordination-redis-source"
              />
            )}
          </div>
          <p className="text-xs text-gray-500">{t("caching.coordination.description")}</p>
          <p className="text-xs text-gray-500">
            {t(`caching.coordination.sourceTooltip.${sourceKey}`, { defaultValue: badge.tooltip })}
          </p>
          <p className="text-xs text-amber-600">{t("caching.coordination.restartNote")}</p>
        </div>

        <CoordinationRedisTypeSelector redisType={redisType} onTypeChange={setSelectedRedisType} />

        <div className="pt-4 border-t border-gray-200">
          <CoordinationRedisFieldSection
            title={t("caching.settings.connection")}
            section="connection"
            redisType={redisType}
            configuredSecrets={configuredSecrets}
          />
        </div>

        {redisType === "cluster" && (
          <div className="pt-4 border-t border-gray-200">
            <CoordinationRedisFieldSection
              title={t("caching.settings.cluster")}
              section="cluster"
              redisType={redisType}
              configuredSecrets={configuredSecrets}
              gridCols="grid-cols-1 gap-6"
            />
          </div>
        )}

        {redisType === "sentinel" && (
          <div className="pt-4 border-t border-gray-200">
            <CoordinationRedisFieldSection
              title={t("caching.settings.sentinel")}
              section="sentinel"
              redisType={redisType}
              configuredSecrets={configuredSecrets}
            />
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <CoordinationRedisFieldSection
            title={t("caching.settings.ssl")}
            section="ssl"
            redisType={redisType}
            configuredSecrets={configuredSecrets}
          />
        </div>
      </Form>

      <div className="border-t border-gray-200 pt-6 flex justify-end gap-3">
        <Button onClick={handleTestConnection} loading={testConnection.isPending}>
          {testConnection.isPending ? t("caching.settings.testing") : t("caching.settings.test")}
        </Button>
        <Button type="primary" onClick={handleSaveChanges} loading={updateSettings.isPending}>
          {updateSettings.isPending ? t("caching.settings.saving") : t("caching.settings.save")}
        </Button>
      </div>
    </div>
  );
};

export default CoordinationRedisSettings;
