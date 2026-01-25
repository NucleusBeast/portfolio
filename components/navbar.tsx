"use client";

import Link from "next/link";
import {cn} from "@/lib/utils";
import {usePathname} from "next/navigation";
import Image from "next/image";

const navItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Demo", href: "/demo" },
    { label: "Admin", href: "/admin" },
]

export default function Navbar(){

    const pathname = usePathname();

    // Split items: all but last, and last item separately
    const mainItems = navItems.slice(0, -1);
    const lastItem = navItems[navItems.length - 1];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-semibold text-foreground">
                        <Image
                            src="/logo.png"
                            alt="NucleusBeast Profile Picture"
                            width={24}
                            height={24}
                        />
                    </Link>
                    <ul className="flex items-center gap-1">
                        {mainItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground",
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
                    href={lastItem.href}
                    className={cn(
                        "px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground",
                        pathname === lastItem.href
                            ? "text-foreground"
                            : "text-muted-foreground"
                    )}
                >
                    {lastItem.label}
                </Link>
            </nav>
        </header>
    );
}
