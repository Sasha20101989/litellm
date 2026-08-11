import type { RoleMappings as RoleMappingsType } from "@/app/(dashboard)/hooks/sso/useSSOSettings";
import { Card, Divider, Table, Tag, Typography } from "antd";
import { Users } from "lucide-react";
import { defaultRoleDisplayNames } from "./constants";
import { useTranslation } from "react-i18next";
const { Title, Text } = Typography;

export default function RoleMappings({ roleMappings }: { roleMappings: RoleMappingsType | undefined }) {
  const { t } = useTranslation("settings");
  if (!roleMappings) {
    return null;
  }

  const roleMappingsColumns = [
    {
      title: t("admin.sso.mappings.role"),
      dataIndex: "role",
      key: "role",
      render: (text: string) => (
        <Text strong>
          {text === "internal_user_viewer"
            ? t("admin.sso.roles.internal_user_viewer")
            : text === "internal_user"
              ? t("admin.sso.roles.internal_user")
              : text === "proxy_admin_viewer"
                ? t("admin.sso.roles.proxy_admin_viewer")
                : text === "proxy_admin"
                  ? t("admin.sso.roles.proxy_admin")
                  : defaultRoleDisplayNames[text] || text}
        </Text>
      ),
    },
    {
      title: t("admin.sso.mappings.groups"),
      dataIndex: "groups",
      key: "groups",
      render: (groups: string[]) => (
        <>
          {groups.length > 0 ? (
            groups.map((group, index) => (
              <Tag key={index} color="blue">
                {group}
              </Tag>
            ))
          ) : (
            <Text className="text-gray-400 italic">{t("admin.sso.mappings.noGroups")}</Text>
          )}
        </>
      ),
    },
  ];
  return (
    <Card>
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-gray-400 mb-2" />
        <Title level={3}>{t("admin.sso.mappings.title")}</Title>
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Title level={5}>{t("admin.sso.mappings.groupClaim")}</Title>
            <div>
              <Text code>{roleMappings.group_claim}</Text>
            </div>
          </div>
          <div>
            <Title level={5}>{t("admin.sso.mappings.defaultRole")}</Title>
            <div>
              <Text strong>
                {roleMappings.default_role === "internal_user_viewer"
                  ? t("admin.sso.roles.internal_user_viewer")
                  : roleMappings.default_role === "internal_user"
                    ? t("admin.sso.roles.internal_user")
                    : roleMappings.default_role === "proxy_admin_viewer"
                      ? t("admin.sso.roles.proxy_admin_viewer")
                      : roleMappings.default_role === "proxy_admin"
                        ? t("admin.sso.roles.proxy_admin")
                        : defaultRoleDisplayNames[roleMappings.default_role] || roleMappings.default_role}
              </Text>
            </div>
          </div>
        </div>
        <Divider />
        <Table
          columns={roleMappingsColumns}
          dataSource={Object.entries(roleMappings.roles).map(([role, groups]) => ({
            role,
            groups,
          }))}
          pagination={false}
          bordered
          size="small"
          className="w-full"
        />
      </div>
    </Card>
  );
}
