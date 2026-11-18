"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemePicker } from "@/components/theme-picker";
import { tuiSections, useActiveSection } from "@/components/use-active-section";
import { adminSidebarItems } from "@/lib/admin-nav";
import { tuiThemeIds } from "@/lib/themes";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

function useScrollLabel() {
  const [label, setLabel] = useState("Top");

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setLabel("All");
      } else if (window.scrollY <= 0) {
        setLabel("Top");
      } else if (window.scrollY >= max - 2) {
        setLabel("Bot");
      } else {
        setLabel(`${Math.round((window.scrollY / max) * 100)}%`);
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return label;
}

export function StatusBar({
  variant = "site",
}: {
  variant?: "site" | "admin";
}) {
  const isAdmin = variant === "admin";
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const active = useActiveSection(isHomePage);
  const scrollLabel = useScrollLabel();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (document.querySelector("[role='dialog'], [role='menu']")) return;

      if (event.key === "t" || event.key === "T") {
        const current = Math.max(0, tuiThemeIds.indexOf(resolvedTheme ?? ""));
        const step = event.key === "T" ? -1 : 1;
        setTheme(
          tuiThemeIds[
            (current + step + tuiThemeIds.length) % tuiThemeIds.length
          ],
        );
        return;
      }

      if (isAdmin) {
        const item = adminSidebarItems[Number(event.key) - 1];
        if (/^[1-9]$/.test(event.key) && item) {
          event.preventDefault();
          router.push(item.href);
        }
        return;
      }

      const section = tuiSections.find((item) => item.key === event.key);
      if (!section) return;
      event.preventDefault();

      if (!section.id) {
        if (isHomePage) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          history.replaceState(null, "", "/");
        } else {
          router.push("/");
        }
        return;
      }

      if (isHomePage) {
        document
          .getElementById(section.id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", section.href);
      } else {
        router.push(`/${section.href}`);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAdmin, isHomePage, router, setTheme, resolvedTheme]);

  const sectionPath = isAdmin
    ? ""
    : isHomePage
      ? active && active !== "/"
        ? `/${active.slice(1)}`
        : ""
      : pathname;

  return (
    <div className="tui-statusbar">
      <span className="tui-status-mode">{isAdmin ? "ADMIN" : "NORMAL"}</span>
      <span className="tui-status-path">
        {isAdmin ? `~${pathname}` : `~/portfolio${sectionPath}`}
      </span>
      <span className="tui-status-hints" aria-hidden="true">
        <kbd>1-5</kbd> jump <kbd>t</kbd> theme
      </span>
      <span className="tui-status-spacer" />
      <ThemePicker className="tui-status-segment" />
      <span className="tui-status-segment tui-status-enc">utf-8</span>
      {isAdmin ? null : <span className="tui-status-pos">{scrollLabel}</span>}
    </div>
  );
}
