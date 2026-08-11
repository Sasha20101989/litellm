import { useTranslation } from "react-i18next";

export type ModelViewType = "groups" | "individual";

interface ModelViewToggleProps {
  value: ModelViewType;
  onChange: (value: ModelViewType) => void;
}

export default function ModelViewToggle({ value, onChange }: ModelViewToggleProps) {
  const { t } = useTranslation("usage");
  const options: readonly { value: ModelViewType; label: string }[] = [
    { value: "groups", label: t("modelToggle.publicName") },
    { value: "individual", label: t("modelToggle.liteLLMName") },
  ];
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            value === option.value ? "bg-white shadow-xs text-gray-900" : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
