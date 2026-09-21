"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const ThemeToggle: React.FC = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation("navigation");
  const isDark = resolvedTheme === "dark";
  const label = isDark ? t("theme.switchToLight") : t("theme.switchToDark");

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      className="text-muted-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon /> : <Sun />}
    </Button>
  );
};

export default ThemeToggle;
