"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getThemeLabel, tuiThemeFamilies } from "@/lib/themes";
import { cn } from "@/lib/utils";

/** Three colour cells that show a theme. The colours come from the CSS theme. */
export function ThemeSwatch({ themeId }: { themeId: string }) {
  return (
    <span className="tui-swatch" data-theme={themeId} aria-hidden="true">
      <i style={{ background: "var(--tui-bg)" }} />
      <i style={{ background: "var(--tui-fg)" }} />
      <i style={{ background: "var(--tui-accent)" }} />
    </span>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

type ThemePickerProps = {
  className?: string;
  side?: "top" | "bottom";
  align?: "start" | "end";
};

export function ThemePicker({
  className,
  side = "top",
  align = "end",
}: ThemePickerProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const label = mounted ? getThemeLabel(theme) : "theme";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn("tui-theme-trigger", className)}
          aria-label="Change color theme"
          title="Change color theme (t)"
        >
          <span className="tui-theme-dot" aria-hidden="true" />
          <span className="tui-theme-label">{label.toLowerCase()}</span>
          <span aria-hidden="true">▾</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={align}
        className="tui-theme-menu max-h-[70vh] w-80 overflow-y-auto"
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          :colorscheme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={mounted ? (theme ?? "system") : undefined}
          onValueChange={setTheme}
        >
          <DropdownMenuRadioItem value="system">
            <span className="flex-1">system</span>
            <span className="text-muted-foreground text-xs">auto</span>
          </DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {tuiThemeFamilies.map((family) => (
            <div className="tui-theme-row" key={family.id}>
              <span className="tui-theme-row-label">
                {family.label.toLowerCase()}
              </span>
              {(["light", "dark"] as const).map((mode) => (
                <DropdownMenuRadioItem
                  key={family[mode]}
                  value={family[mode]}
                  className="tui-theme-option pr-2 pl-6"
                  aria-label={`${family.label} ${mode}`}
                >
                  <ThemeSwatch themeId={family[mode]} />
                  <span>{mode}</span>
                </DropdownMenuRadioItem>
              ))}
            </div>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
