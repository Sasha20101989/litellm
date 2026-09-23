import React from "react";
import { z } from "zod/v4";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FormField } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useZodForm } from "@/lib/forms/useZodForm";
import { CredentialItem } from "../networking";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface ReuseCredentialsModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onAddCredential: (values: Record<string, unknown>) => void;
  existingCredential: CredentialItem | null;
  setIsCredentialModalOpen: (isVisible: boolean) => void;
}

const reuseCredentialsSchema = (requiredMessage: string) =>
  z.object({
    credential_name: z.string().min(1, requiredMessage),
  });

type ReuseCredentialsFormValues = { credential_name: string };

const storedValuesOf = (existingCredential: CredentialItem | null): Record<string, unknown> => {
  const values: unknown = existingCredential?.credential_values;
  return typeof values === "object" && values !== null ? (values as Record<string, unknown>) : {};
};

const ReuseCredentialsModal: React.FC<ReuseCredentialsModalProps> = ({
  isVisible,
  onCancel,
  onAddCredential,
  existingCredential,
  setIsCredentialModalOpen,
}) => {
  const { t } = useTranslation("gateway");
  const fieldIdPrefix = React.useId();
  const storedValues = storedValuesOf(existingCredential);
  const form = useZodForm(reuseCredentialsSchema(t("models.reuseCredentials.required")), {
    defaultValues: { credential_name: existingCredential?.credential_name ?? "" },
  });

  const handleSubmit = (values: ReuseCredentialsFormValues) => {
    onAddCredential({ ...storedValues, ...values });
    form.reset();
    setIsCredentialModalOpen(false);
  };

  const handleCancel = () => {
    onCancel();
    form.reset();
  };

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("models.reuseCredentials.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <FieldGroup>
              <FormField control={form.control} name="credential_name" label={t("models.reuseCredentials.name")}>
                {({ ref, ...field }) => (
                  <Input {...field} ref={ref} placeholder={t("models.reuseCredentials.placeholder")} />
                )}
              </FormField>

              {Object.entries(storedValues).map(([key, value]) => (
                <Field key={key}>
                  <FieldLabel htmlFor={`${fieldIdPrefix}-${key}`}>{key}</FieldLabel>
                  <Input id={`${fieldIdPrefix}-${key}`} value={String(value)} placeholder={key} disabled readOnly />
                </Field>
              ))}

              <div className="flex justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {t("models.reuseCredentials.cancel")}
                </Button>
                <Button type="submit">{t("models.reuseCredentials.submit")}</Button>
              </div>
            </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReuseCredentialsModal;
