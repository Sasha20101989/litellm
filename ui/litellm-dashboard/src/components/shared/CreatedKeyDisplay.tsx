import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

interface CreatedKeyDisplayProps {
  apiKey: string;
}

/**
 * Shared component for displaying a newly-created virtual key.
 * Used on the Virtual Keys page and in the Add Agent wizard.
 */
const CreatedKeyDisplay: React.FC<CreatedKeyDisplayProps> = ({ apiKey }) => {
  const { t } = useTranslation("gateway");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    toast.success(t("virtualKeys.sharedDetails.keyCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p className="mb-2">
        {t("virtualKeys.sharedDetails.saveSecretBefore")} <b>{t("virtualKeys.sharedDetails.saveSecretEmphasis")}</b>{" "}
        {t("virtualKeys.sharedDetails.saveSecretAfter")}
      </p>

      <p className="text-sm text-muted-foreground mt-3 mb-1">{t("virtualKeys.sharedDetails.virtualKey")}:</p>
      <div className="bg-muted rounded-md p-2.5 mb-2.5">
        <pre className="m-0 whitespace-normal break-words text-foreground">{apiKey}</pre>
      </div>

      <CopyToClipboard text={apiKey} onCopy={handleCopy}>
        <Button className="mt-3">
          {copied ? t("virtualKeys.sharedDetails.copied") : t("virtualKeys.sharedDetails.copyVirtualKey")}
        </Button>
      </CopyToClipboard>
    </div>
  );
};

export default CreatedKeyDisplay;
