"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import type React from "react";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, FolderKanban, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

const sidebarItems = [
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Skills", href: "/admin/skills", icon: Sparkles },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const admins = useQuery(api.models.admins.get);
  const isAdmin =
    email && admins ? admins.some((admin) => admin.email === email) : undefined;

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!email) {
      router.replace("/sign-in");
      return;
    }

    if (isAdmin === false) {
      void signOut().then(() => router.replace("/"));
    }
  }, [email, isAdmin, isLoaded, router, signOut]);

  if (!isLoaded || isAdmin === undefined) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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
      return "New Skill";
    }
    return "New Project";
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar">
        <div className="flex h-full flex-col">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Admin Panel
            </h2>
            <p className="text-sm text-muted-foreground">Manage your content</p>
          </div>
          <nav className="flex-1 px-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => void signOut().then(() => router.push("/"))}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="flex items-center justify-between border-b px-8 py-4">
          <h1 className="text-2xl font-semibold">
            {pathname.includes("/admin/skills") ? "Skills" : "Projects"}
          </h1>
          <Link href={getCreateLink()}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {getCreateLabel()}
            </Button>
          </Link>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
