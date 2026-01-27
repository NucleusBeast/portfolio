"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const navItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "#projects" },
    { label: "About", href: "#about" },
    { label: "Demo", href: "/demo" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();

        // Initial user fetch
        supabase.auth.getUser().then(({ data }) => {
            const email = data.user?.email;
            if (email) {
                setUsername(email.split("@")[0]);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const email = session?.user?.email;
            setUsername(email ? email.split("@")[0] : null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
            <nav className="container mx-auto flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-semibold text-foreground">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={24}
                            height={24}
                        />
                    </Link>

                    <ul className="flex items-center gap-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                                        pathname === item.href
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <Link
                    href="/admin"
                    className={cn(
                        "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === "/admin"
                            ? "text-foreground"
                            : "text-muted-foreground"
                    )}
                >
                    {username ?? "Admin"}
                </Link>
            </nav>
        </header>
    );
}