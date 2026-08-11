import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import NotificationsManager from "../molecules/notifications_manager";
import { getEmailEventSettings, updateEmailEventSettings, resetEmailEventSettings } from "../networking";
import { EmailEvent } from "../../types";
import { EmailEventSetting } from "./types";
import { useTranslation } from "react-i18next";

interface EmailEventSettingsProps {
  accessToken: string | null;
}

const EmailEventSettings: React.FC<EmailEventSettingsProps> = ({ accessToken }) => {
  const { t } = useTranslation("settings");
  const [loading, setLoading] = useState(true);
  const [eventSettings, setEventSettings] = useState<EmailEventSetting[]>([]);

  // Fetch email event settings on component mount
  useEffect(() => {
    fetchEventSettings();
  }, [accessToken]);

  const fetchEventSettings = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await getEmailEventSettings(accessToken);
      setEventSettings(response.settings);
    } catch (error) {
      console.error("Failed to fetch email event settings:", error);
      NotificationsManager.fromBackend(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (event: EmailEvent, checked: boolean) => {
    const updatedSettings = eventSettings.map((setting) =>
      setting.event === event ? { ...setting, enabled: checked } : setting,
    );
    setEventSettings(updatedSettings);
  };

  const handleSaveSettings = async () => {
    if (!accessToken) return;

    try {
      await updateEmailEventSettings(accessToken, { settings: eventSettings });
      NotificationsManager.success(t("logging.email.eventUpdated"));
    } catch (error) {
      console.error("Failed to update email event settings:", error);
      NotificationsManager.fromBackend(error);
    }
  };

  const handleResetSettings = async () => {
    if (!accessToken) return;

    try {
      await resetEmailEventSettings(accessToken);
      NotificationsManager.success(t("logging.email.eventReset"));
      // Refresh settings after reset
      fetchEventSettings();
    } catch (error) {
      console.error("Failed to reset email event settings:", error);
      NotificationsManager.fromBackend(error);
    }
  };

  // Helper function to get a description for each event type
  const getEventDescription = (event: EmailEvent): string => {
    // Convert event name to a sentence with more context
    if (event.includes("Virtual Key Created")) {
      return t("logging.email.virtualKeyCreated");
    } else if (event.includes("New User Invitation")) {
      return t("logging.email.userInvitation");
    } else {
      // Handle any other event type from the API
      const words = event
        .split(/(?=[A-Z])/)
        .join(" ")
        .toLowerCase();
      return t("logging.email.genericEvent", { event: words });
    }
  };

  const getEventLabel = (event: EmailEvent): string => {
    if (event.includes("Virtual Key Created")) return t("logging.email.virtualKeyCreatedLabel");
    if (event.includes("New User Invitation")) return t("logging.email.userInvitationLabel");
    return event;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("logging.email.notifications")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("logging.email.notificationsDescription")}</p>
      </CardHeader>

      <CardContent>
        <Separator className="mb-6" />

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {eventSettings.map((setting) => (
              <div key={setting.event} className="flex items-start">
                <Checkbox
                  checked={setting.enabled}
                  onCheckedChange={(checked) => handleCheckboxChange(setting.event, checked === true)}
                  className="mt-1"
                />
                <div className="ml-3">
                  <p className="text-sm">{getEventLabel(setting.event)}</p>
                  <div className="block text-sm text-muted-foreground">{getEventDescription(setting.event)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {t("logging.email.save")}
          </Button>
          <Button variant="secondary" onClick={handleResetSettings} disabled={loading}>
            {t("logging.email.reset")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailEventSettings;
