import {
  BankOutlined,
  BarChartOutlined,
  GlobalOutlined,
  LineChartOutlined,
  RobotOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge, Select } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { hasCapability, type Capability } from "@/utils/capabilities";
import { all_admin_roles } from "@/utils/roles";
export type UsageOption =
  | "global"
  | "my-usage"
  | "organization"
  | "team"
  | "customer"
  | "tag"
  | "agent"
  | "user"
  | "user-agent-activity";
export interface UsageViewSelectProps {
  value: UsageOption;
  onChange: (value: UsageOption) => void;
  userRole: string | null;
  canViewTagUsage?: boolean;
  title?: string;
  description?: string;
  "data-id"?: string;
}
interface OptionConfig {
  value: UsageOption;
  label: string;
  description: string;
  icon: React.ReactNode;
  capability?: Capability;
  adminOnly?: boolean;
  showForAdmin?: string;
  showForNonAdmin?: string;
  descriptionForAdmin?: string;
  descriptionForNonAdmin?: string;
  badgeText?: string;
}
const OPTIONS: OptionConfig[] = [
  {
    value: "global",
    label: "Global Usage",
    showForAdmin: "Global Usage",
    showForNonAdmin: "Your Usage",
    description: "View usage across all resources",
    descriptionForAdmin: "View usage across all resources",
    descriptionForNonAdmin: "View your usage",
    icon: <GlobalOutlined style={{ fontSize: "16px" }} />,
  },
  {
    value: "my-usage",
    label: "Your Usage",
    description: "View your own usage",
    icon: <UserOutlined style={{ fontSize: "16px" }} />,
    adminOnly: true,
  },
  {
    value: "organization",
    label: "Organization Usage",
    description: "View usage across all organizations",
    icon: <BankOutlined style={{ fontSize: "16px" }} />,
    capability: "viewOrganizationUsage",
  },
  {
    value: "team",
    label: "Team Usage",
    description: "View usage by team",
    icon: <TeamOutlined style={{ fontSize: "16px" }} />,
  },
  {
    value: "customer",
    label: "Customer Usage",
    description: "View usage by customer accounts",
    icon: <ShoppingCartOutlined style={{ fontSize: "16px" }} />,
    adminOnly: true,
  },
  {
    value: "tag",
    label: "Tag Usage",
    description: "View usage grouped by tags",
    icon: <TagsOutlined style={{ fontSize: "16px" }} />,
    adminOnly: true,
  },
  {
    value: "agent",
    label: "Agent Usage (A2A)",
    description: "View usage by AI agents",
    icon: <RobotOutlined style={{ fontSize: "16px" }} />,
    capability: "viewAgentUsage",
  },
  {
    value: "user",
    label: "User Usage",
    description: "View usage by individual users",
    icon: <UserOutlined style={{ fontSize: "16px" }} />,
    adminOnly: true,
  },
  {
    value: "user-agent-activity",
    label: "User Agent Activity",
    description: "View detailed user agent activity logs",
    icon: <LineChartOutlined style={{ fontSize: "16px" }} />,
    adminOnly: true,
  },
];
export const UsageViewSelect: React.FC<UsageViewSelectProps> = ({
  value,
  onChange,
  userRole,
  canViewTagUsage = false,
  title,
  description,
  "data-id": dataId,
}) => {
  const { t } = useTranslation("usage");
  const isAdmin = all_admin_roles.includes(userRole ?? "");
  const optionKeys: Record<UsageOption, string> = {
    global: "global",
    "my-usage": "personal",
    organization: "organization",
    team: "team",
    customer: "customer",
    tag: "tag",
    agent: "agent",
    user: "user",
    "user-agent-activity": "userAgent",
  };
  const getFilteredOptions = () => {
    return OPTIONS.filter((option) => {
      if (option.capability) {
        return hasCapability(userRole, option.capability);
      }
      if (option.value === "tag" && canViewTagUsage) {
        return true;
      }
      if (option.adminOnly && !isAdmin) {
        return false;
      }
      return true;
    }).map((option) => {
      const optionKey = optionKeys[option.value];
      let label = t(`selector.options.${optionKey}.label`, { defaultValue: option.label });
      let desc = t(`selector.options.${optionKey}.description`, { defaultValue: option.description });
      if (option.showForAdmin && option.showForNonAdmin) {
        label = isAdmin
          ? t("selector.options.global.label", { defaultValue: option.showForAdmin })
          : t("selector.options.personal.label", { defaultValue: option.showForNonAdmin });
      }
      if (option.descriptionForAdmin && option.descriptionForNonAdmin) {
        desc = isAdmin
          ? t("selector.options.global.description", { defaultValue: option.descriptionForAdmin })
          : t("selector.options.personal.description", { defaultValue: option.descriptionForNonAdmin });
      }
      return {
        value: option.value,
        label,
        description: desc,
        icon: option.icon,
        badgeText: option.badgeText,
      };
    });
  };
  const filteredOptions = getFilteredOptions();
  return (
    <div className="w-full" data-id={dataId}>
      <div className="flex flex-wrap items-center justify-start gap-4">
        <div className="flex items-stretch gap-2 min-w-0">
          <div className="shrink-0 flex items-center">
            <BarChartOutlined style={{ fontSize: "32px" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-0.5 leading-tight">{title ?? t("selector.title")}</h3>
            <p className="text-xs text-gray-600 leading-tight">{description ?? t("selector.description")}</p>
          </div>
        </div>
        <div className="shrink-0">
          <Select
            value={value}
            onChange={onChange}
            className="w-54 sm:w-64 md:w-72"
            size="large"
            options={filteredOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            optionRender={(option) => {
              const opt = filteredOptions.find((o) => o.value === option.value);
              if (!opt) return option.label;
              return (
                <div className="flex items-center gap-2 py-1">
                  <div className="shrink-0 mt-0.5">{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{opt.description}</div>
                  </div>
                  {opt.badgeText && (
                    <div className="items-center">
                      <Badge color="blue" count={opt.badgeText} />
                    </div>
                  )}
                </div>
              );
            }}
            labelRender={(props) => {
              const opt = filteredOptions.find((o) => o.value === props.value);
              if (!opt) return props.label;
              return (
                <div className="flex items-center gap-2">
                  <div>{opt.icon}</div>
                  <span className="text-sm">{opt.label}</span>
                </div>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};
