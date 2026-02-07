"use client";

import React from "react"

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, FolderKanban, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {createClient} from "@/utils/supabase/client";

const sidebarItems = [
    { label: "Projects", href: "/admin/projects", icon: FolderKanban },
    { label: "Skills", href: "/admin/skills", icon: Sparkles },
];


export default function AdminLayout({children} : {children: React.ReactNode}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = async () => {
        const supabase = createClient();

        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

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
                        <p className="text-sm text-muted-foreground">
                            Manage your content
                        </p>
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
                                                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
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
                            onClick={handleLogout}
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
};