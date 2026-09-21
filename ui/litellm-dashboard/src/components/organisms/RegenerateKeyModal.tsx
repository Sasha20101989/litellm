import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { Alert, AlertTitle } from "@/components/shared/Alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, CircleHelp, Copy, RefreshCw, TriangleAlert } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWatch } from "react-hook-form";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { z } from "zod/v4";
import { KeyResponse } from "../key_team_helpers/key_list";
import { toast } from "@/lib/toast";
import { regenerateKeyCall } from "../networking";
import { FieldGroup } from "@/components/ui/field";
import { FormField } from "@/components/shared/form/FormField";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useZodForm } from "@/lib/forms/useZodForm";
import { calculateExpiryPreviewFromDuration, formatExpiresUtc, isKeyExpired } from "@/utils/keyExpiryUtils";
import { buildRegenerateKeyPayload, type RegenerateKeyFormValues } from "./regenerateKeyPayload";

const DURATION_PATTERN = /^(\d+(s|m|h|d|w|mo))?$/;
const EMPTY_VALUES: RegenerateKeyFormValues = {
  key_alias: undefined,
  max_budget: undefined,
  tpm_limit: undefined,
  rpm_limit: undefined,
  duration: "",
  grace_period: "",
};

const buildSchema = (
  keyIsExpired: boolean,
  durationMessage: string,
  expiredDurationMessage: string,
): z.ZodType<RegenerateKeyFormValues, RegenerateKeyFormValues> => {
  const shape = {
    key_alias: z.string().nullish(),
    max_budget: z.number().nullish(),
    tpm_limit: z.number().nullish(),
    rpm_limit: z.number().nullish(),
    duration: keyIsExpired
      ? z.string().min(1, expiredDurationMessage).regex(DURATION_PATTERN, durationMessage)
      : z.string().regex(DURATION_PATTERN, durationMessage),
    grace_period: z.string().regex(DURATION_PATTERN, durationMessage),
  };

  return z.object(shape);
};

const labelWithHint = (label: string, hint: string): React.ReactNode => (
  <>
    {label}
    <Tooltip>
      <TooltipTrigger render={<CircleHelp className="size-3.5 shrink-0 cursor-help text-muted-foreground" />} />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  </>
);

interface RegenerateKeyModalProps {
  selectedToken: KeyResponse | null;
  visible: boolean;
  onClose: () => void;
  onKeyUpdate?: (updatedKeyData: Partial<KeyResponse>) => void;
}

export function RegenerateKeyModal({ selectedToken, visible, onClose, onKeyUpdate }: RegenerateKeyModalProps) {
  const { t } = useTranslation("gateway");
  const { accessToken } = useAuthorized();
  const [regeneratedKey, setRegeneratedKey] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const keyIsExpired = isKeyExpired(selectedToken?.expires);
  const schema = useMemo(
    () =>
      buildSchema(
        keyIsExpired,
        t("virtualKeys.regenerate.durationInvalid"),
        t("virtualKeys.regenerate.expirationRequired"),
      ),
    [keyIsExpired, t],
  );
  const form = useZodForm(schema, { defaultValues: EMPTY_VALUES });
  const durationValue = useWatch({ control: form.control, name: "duration" });

  useEffect(() => {
    if (visible && selectedToken && accessToken) {
      const seededValues: RegenerateKeyFormValues = {
        key_alias: selectedToken.key_alias,
        max_budget: selectedToken.max_budget,
        tpm_limit: selectedToken.tpm_limit,
        rpm_limit: selectedToken.rpm_limit,
        duration: selectedToken.duration || "",
        grace_period: "",
      };
      form.reset(seededValues);
    }
  }, [visible, selectedToken, form, accessToken]);

  const newExpiryTime = durationValue ? calculateExpiryPreviewFromDuration(durationValue) : null;

  const submitRegenerateKey = async (values: RegenerateKeyFormValues) => {
    if (!selectedToken || !accessToken) return;

    const formValues = buildRegenerateKeyPayload(values);
    try {
      const response = await regenerateKeyCall(accessToken, selectedToken.token || selectedToken.token_id, formValues);
      setRegeneratedKey(response.key);
      toast.success(t("virtualKeys.regenerate.success"));

      // Build the update payload. Spread the API response first so any new
      // fields it returns (new token, timestamps, etc.) are captured, then
      // override with the explicit form values — the user's just-submitted
      // edits must win over whatever the API echoes back.
      // expires must come from the API (an ISO string), never the locale-
      // formatted preview, otherwise downstream expiry parsing breaks.
      const updatedKeyData: Partial<KeyResponse> = {
        ...response,
        token: response.token_id || response.token || selectedToken.token,
        key_name: response.key,
        max_budget: formValues.max_budget,
        tpm_limit: formValues.tpm_limit,
        rpm_limit: formValues.rpm_limit,
        expires: response.expires ?? selectedToken.expires,
      };

      // Update the parent component with new key data
      if (onKeyUpdate) {
        onKeyUpdate(updatedKeyData);
      }

      setIsRegenerating(false);
    } catch (error) {
      setIsRegenerating(false); // Reset regenerating state on error
      console.error("Error regenerating key:", error);
      toast.fromError(error);
    }
  };

  const handleRegenerateKey = () => {
    if (!selectedToken || !accessToken) return;

    setIsRegenerating(true);
    void form.handleSubmit(submitRegenerateKey, () => setIsRegenerating(false))();
  };

  const handleClose = () => {
    setRegeneratedKey(null);
    setIsRegenerating(false);
    setCopied(false);
    form.reset(EMPTY_VALUES);
    onClose();
  };

  const handleCopyKey = () => {
    setCopied(true);
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleClose()} disablePointerDismissal>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t("virtualKeys.regenerate.title")}</DialogTitle>
        </DialogHeader>
        {regeneratedKey ? (
          <div className="flex flex-col gap-4">
            <Alert variant="warning">
              <TriangleAlert />
              <AlertTitle>{t("virtualKeys.regenerate.saveWarning")}</AlertTitle>
            </Alert>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{t("virtualKeys.edit.keyAlias")}</span>
              <span className="text-sm text-foreground">
                {selectedToken?.key_alias || t("virtualKeys.regenerate.noAlias")}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">{t("virtualKeys.details.virtualKey")}</span>
              <div className="rounded-md border border-border bg-muted px-4 py-3.5 font-mono text-base break-all text-foreground">
                {regeneratedKey}
              </div>
            </div>
          </div>
        ) : (
          <TooltipProvider>
            <form onSubmit={(event) => event.preventDefault()} noValidate className="mt-1">
              <FieldGroup>
                <FormField control={form.control} name="key_alias" label={t("virtualKeys.edit.keyAlias")}>
                  {({ ref, value, ...field }) => <Input {...field} ref={ref} value={value ?? ""} disabled />}
                </FormField>

                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="max_budget" label={t("virtualKeys.edit.maxBudget")}>
                    {({ ref, value, onChange, ...field }) => (
                      <Input
                        {...field}
                        ref={ref}
                        type="number"
                        step={0.01}
                        value={value ?? ""}
                        onChange={(event) => onChange(event.target.value === "" ? null : event.target.valueAsNumber)}
                      />
                    )}
                  </FormField>

                  <FormField control={form.control} name="tpm_limit" label={t("virtualKeys.edit.tpmLimit")}>
                    {({ ref, value, onChange, ...field }) => (
                      <Input
                        {...field}
                        ref={ref}
                        type="number"
                        value={value ?? ""}
                        onChange={(event) => onChange(event.target.value === "" ? null : event.target.valueAsNumber)}
                      />
                    )}
                  </FormField>

                  <FormField control={form.control} name="rpm_limit" label={t("virtualKeys.edit.rpmLimit")}>
                    {({ ref, value, onChange, ...field }) => (
                      <Input
                        {...field}
                        ref={ref}
                        type="number"
                        value={value ?? ""}
                        onChange={(event) => onChange(event.target.value === "" ? null : event.target.valueAsNumber)}
                      />
                    )}
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="duration"
                    label={t("virtualKeys.regenerate.expires")}
                    description={
                      <span className="flex flex-col gap-0.5 text-xs">
                        <span className={keyIsExpired ? "text-destructive" : "text-muted-foreground"}>
                          {t("virtualKeys.regenerate.currentExpiry", {
                            date: selectedToken?.expires
                              ? formatExpiresUtc(selectedToken.expires)
                              : t("virtualKeys.values.never"),
                          })}
                          {keyIsExpired && ` ${t("virtualKeys.regenerate.expired")}`}
                        </span>
                        {newExpiryTime && (
                          <span className="text-success">
                            {t("virtualKeys.regenerate.newExpiry", { date: newExpiryTime })}
                          </span>
                        )}
                      </span>
                    }
                  >
                    {({ ref, ...field }) => (
                      <Input {...field} ref={ref} placeholder={t("virtualKeys.regenerate.durationPlaceholder")} />
                    )}
                  </FormField>

                  <FormField
                    control={form.control}
                    name="grace_period"
                    label={labelWithHint(
                      t("virtualKeys.regenerate.gracePeriod"),
                      t("virtualKeys.regenerate.gracePeriodHelp"),
                    )}
                    description={
                      <span className="text-xs">{t("virtualKeys.regenerate.gracePeriodRecommendation")}</span>
                    }
                  >
                    {({ ref, ...field }) => (
                      <Input {...field} ref={ref} placeholder={t("virtualKeys.regenerate.gracePeriodPlaceholder")} />
                    )}
                  </FormField>
                </div>
              </FieldGroup>
            </form>
          </TooltipProvider>
        )}
        <DialogFooter>
          {regeneratedKey ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t("virtualKeys.regenerate.close")}
              </Button>
              <CopyToClipboard text={regeneratedKey} onCopy={handleCopyKey}>
                <Button>
                  {copied ? <Check /> : <Copy />}
                  {copied ? t("virtualKeys.regenerate.copied") : t("virtualKeys.regenerate.copyKey")}
                </Button>
              </CopyToClipboard>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t("virtualKeys.edit.cancel")}
              </Button>
              <Button onClick={handleRegenerateKey} disabled={isRegenerating} aria-busy={isRegenerating}>
                <RefreshCw />
                {t("virtualKeys.details.regenerateKey")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
