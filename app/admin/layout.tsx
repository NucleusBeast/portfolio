"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { StatusBar } from "@/components/status-bar";
import { ThemePicker } from "@/components/theme-picker";
import { api } from "@/convex/_generated/api";
import { adminSidebarItems } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const isAdmin = useQuery(api.models.admins.currentUserIsAdmin);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }

    if (isAdmin === false) {
      router.replace("/");
    }
  }, [isAdmin, isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || !isAuthenticated || isAdmin === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">
          authenticating
          <span className="tui-ellipsis" />
        </div>
      </main>
    );
  }

  if (isAdmin === false) {
    return null;
  }

  const getCreateLink = () => {
    if (pathname.includes("/admin/skills")) {
      return "/admin/skills/new";
    }
    return "/admin/projects/new";
  };

  const getCreateLabel = () => {
    if (pathname.includes("/admin/skills")) {
      return "new skill";
    }
    return "new project";
  };

  const getPageTitle = () => {
    if (pathname.includes("/admin/about")) return "About & Contact";
    if (pathname.includes("/admin/analytics")) return "Analytics";
    if (pathname.includes("/admin/skills")) {
      return "Skills";
    }
    if (pathname.includes("/admin/cv")) {
      return "CV";
    }
    if (pathname.includes("/admin/mcp")) return "Claude (MCP)";
    return "Projects";
  };

  const showCreateAction =
    pathname.startsWith("/admin/projects") ||
    pathname.startsWith("/admin/skills");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <p className="admin-sidebar-host">
            <span>admin</span>@nucleusbeast
          </p>
          <p className="tui-comment"># manage your content</p>
        </div>

        <nav className="admin-tree" aria-label="Admin">
          <p className="admin-tree-root">~/admin</p>
          <ul>
            {adminSidebarItems.map((item, index) => {
              const isActive = pathname.startsWith(item.href);
              const isLast = index === adminSidebarItems.length - 1;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "admin-tree-item",
                      isActive && "admin-tree-item-active",
                    )}
                    aria-current={isActive ? "page" : undefined}
                    title={item.label}
                  >
                    <span className="admin-tree-branch" aria-hidden="true">
                      {isLast ? "└── " : "├── "}
                    </span>
                    <span className="admin-tree-name">{item.file}</span>
                    <span className="admin-tree-key">{index + 1}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-sidebar-foot">
          <Link href="/" className="tui-text-btn">
            ← landing
          </Link>
          <button
            type="button"
            className="tui-text-btn admin-logout"
            onClick={() => void signOut().then(() => router.push("/"))}
          >
            logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="min-w-0">
            <p className="tui-comment admin-topbar-path">~{pathname}</p>
            <h1 className="admin-topbar-title">
              <span className="tui-hash">##</span> {getPageTitle()}
            </h1>
          </div>
          <div className="admin-topbar-actions">
            <ThemePicker side="bottom" />
            {showCreateAction ? (
              <Link
                href={getCreateLink()}
                className="tui-button tui-button-primary"
              >
                + {getCreateLabel()}
              </Link>
            ) : null}
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>

      <StatusBar variant="admin" />
    </div>
  );
}
