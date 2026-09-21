import React from "react";
import { useTranslation } from "react-i18next";
import { SearchSelect } from "@/components/shared/SearchSelect";
import { Organization } from "../networking";

interface OrganizationDropdownProps {
  organizations?: Organization[] | null;
  value?: string | null;
  onChange?: (value: string | null) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
  placeholder?: string;
  id?: string;
}

const OrganizationDropdown: React.FC<OrganizationDropdownProps> = ({
  organizations,
  value,
  onChange,
  disabled,
  loading,
  style,
  placeholder,
  id,
}) => {
  const { t } = useTranslation("gateway");
  return (
    <div style={{ minWidth: 280, ...style }}>
      <SearchSelect
        options={(organizations ?? []).map((org) => ({
          label: org.organization_alias || org.organization_id,
          value: org.organization_id,
          sublabel: org.organization_id,
        }))}
        value={value}
        onValueChange={(organizationId) => onChange?.(organizationId)}
        placeholder={placeholder ?? t("virtualKeys.edit.allOrganizations")}
        emptyText={loading ? t("virtualKeys.edit.loadingOrganizations") : t("virtualKeys.edit.noOrganizations")}
        disabled={disabled}
        inputId={id}
      />
    </div>
  );
};

export default OrganizationDropdown;
