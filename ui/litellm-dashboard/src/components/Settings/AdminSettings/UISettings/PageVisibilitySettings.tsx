"use client";

import { getAvailablePages } from "@/components/page_utils";
import { Button, Checkbox, Collapse, Space, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface PageVisibilitySettingsProps {
  enabledPagesInternalUsers: string[] | null | undefined;
  isUpdating: boolean;
  onUpdate: (settings: { enabled_ui_pages_internal_users: string[] | null }) => void;
}

export default function PageVisibilitySettings({
  enabledPagesInternalUsers,
  isUpdating,
  onUpdate,
}: PageVisibilitySettingsProps) {
  const { t } = useTranslation("settings");
  const { t: tNavigation } = useTranslation("navigation");
  // Check if page visibility is set (null/undefined means "not set" = all pages visible)
  const isPageVisibilitySet = enabledPagesInternalUsers !== null && enabledPagesInternalUsers !== undefined;

  // Get available pages from leftnav configuration
  const availablePages = useMemo(() => getAvailablePages(), []);

  // Group pages by their group for better UI
  const pagesByGroup = useMemo(() => {
    const grouped: Record<string, typeof availablePages> = {};
    availablePages.forEach((page) => {
      if (!grouped[page.group]) {
        grouped[page.group] = [];
      }
      grouped[page.group].push(page);
    });
    return grouped;
  }, [availablePages]);

  // Local state for page selection
  const [selectedPages, setSelectedPages] = useState<string[]>(enabledPagesInternalUsers || []);

  // Update local state when data changes
  useMemo(() => {
    if (enabledPagesInternalUsers) {
      setSelectedPages(enabledPagesInternalUsers);
    } else {
      setSelectedPages([]);
    }
  }, [enabledPagesInternalUsers]);

  const handleSavePageVisibility = () => {
    onUpdate({ enabled_ui_pages_internal_users: selectedPages.length > 0 ? selectedPages : null });
  };

  const handleResetToDefault = () => {
    setSelectedPages([]);
    onUpdate({ enabled_ui_pages_internal_users: null });
  };

  const translateGroup = (groupName: string) => {
    const groups: Record<string, string> = {
      "AI GATEWAY": tNavigation("sidebar.groups.AI GATEWAY"),
      OBSERVABILITY: tNavigation("sidebar.groups.OBSERVABILITY"),
      "ACCESS CONTROL": tNavigation("sidebar.groups.ACCESS CONTROL"),
      "DEVELOPER TOOLS": tNavigation("sidebar.groups.DEVELOPER TOOLS"),
      SETTINGS: tNavigation("sidebar.groups.SETTINGS"),
      Tools: tNavigation("sidebar.items.tools"),
      Experimental: tNavigation("sidebar.items.experimental"),
      Settings: tNavigation("sidebar.items.settings"),
    };
    return groupName
      .split(" > ")
      .map((part) => groups[part] || part)
      .join(" > ");
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Space direction="vertical" size={4}>
        <Space align="center">
          <Typography.Text strong>{t("admin.ui.visibility.title")}</Typography.Text>
          {!isPageVisibilitySet && (
            <Tag color="default" style={{ marginLeft: "8px" }}>
              {t("admin.ui.visibility.notSet")}
            </Tag>
          )}
          {isPageVisibilitySet && (
            <Tag color="blue" style={{ marginLeft: "8px" }}>
              {t("admin.ui.visibility.selected", { count: selectedPages.length })}
            </Tag>
          )}
        </Space>
        <Typography.Text type="secondary" style={{ fontSize: "12px", fontStyle: "italic" }}>
          {t("admin.ui.visibility.description")}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: "12px", color: "#8b5cf6" }}>
          {t("admin.ui.visibility.adminNote")}
        </Typography.Text>
      </Space>

      <Collapse
        items={[
          {
            key: "page-visibility",
            label: t("admin.ui.visibility.configure"),
            children: (
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Checkbox.Group value={selectedPages} onChange={setSelectedPages} style={{ width: "100%" }}>
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    {Object.entries(pagesByGroup).map(([groupName, pages]) => (
                      <div key={groupName}>
                        <Typography.Text
                          strong
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            letterSpacing: "0.05em",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          {translateGroup(groupName)}
                        </Typography.Text>
                        <Space direction="vertical" size="small" style={{ marginLeft: "16px", width: "100%" }}>
                          {pages.map((page) => (
                            <div key={page.page} style={{ marginBottom: "4px" }}>
                              <Checkbox value={page.page}>
                                <Space direction="vertical" size={0}>
                                  <Typography.Text>
                                    {tNavigation(`sidebar.items.${page.page}`, { defaultValue: page.label })}
                                  </Typography.Text>
                                  <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                                    {t("admin.ui.visibility.pageDescription", {
                                      page: tNavigation(`sidebar.items.${page.page}`, { defaultValue: page.label }),
                                    })}
                                  </Typography.Text>
                                </Space>
                              </Checkbox>
                            </div>
                          ))}
                        </Space>
                      </div>
                    ))}
                  </Space>
                </Checkbox.Group>

                <Space>
                  <Button type="primary" onClick={handleSavePageVisibility} loading={isUpdating} disabled={isUpdating}>
                    {t("admin.ui.visibility.save")}
                  </Button>
                  {isPageVisibilitySet && (
                    <Button onClick={handleResetToDefault} loading={isUpdating} disabled={isUpdating}>
                      {t("admin.ui.visibility.reset")}
                    </Button>
                  )}
                </Space>
              </Space>
            ),
          },
        ]}
      />
    </Space>
  );
}
