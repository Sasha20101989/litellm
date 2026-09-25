"use client";

import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface FocusAppearanceControlsProps {
  theme: "light" | "dark";
  lightThemeLabel: string;
  darkThemeLabel: string;
  onToggleTheme: () => void;
  className?: string;
}

export function FocusAppearanceControls({
  theme,
  lightThemeLabel,
  darkThemeLabel,
  onToggleTheme,
  className,
}: FocusAppearanceControlsProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <LanguageSelector />
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? lightThemeLabel : darkThemeLabel}
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    </div>
  );
}
