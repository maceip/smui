"use client";

import { useState, useCallback, useEffect } from "react";
import { THEME_PRESETS, applyThemePreset, clearThemePreset } from "@/lib/theme-presets";
import type { ThemePreset } from "@/lib/theme-presets";

export function ThemePresetSwitcher() {
  const [active, setActive] = useState<string>("nord");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const apply = useCallback((preset: ThemePreset) => {
    setActive(preset.id);
    if (preset.id === "nord") {
      // Revert to CSS-defined defaults
      clearThemePreset();
    } else {
      applyThemePreset(preset);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground tracking-widest uppercase mr-0.5">
        theme
      </span>
      {THEME_PRESETS.map((preset) => (
        <button
          key={preset.id}
          title={preset.name}
          onClick={() => apply(preset)}
          className="h-[18px] px-1.5 text-[10px] uppercase tracking-wider border cursor-pointer transition-colors"
          style={{
            borderColor: active === preset.id ? preset.swatch : "transparent",
            color: active === preset.id ? preset.swatch : undefined,
          }}
        >
          {active === preset.id ? (
            <span style={{ color: preset.swatch }}>{preset.name}</span>
          ) : (
            <span className="text-muted-foreground hover:text-foreground transition-colors">
              {preset.name}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
