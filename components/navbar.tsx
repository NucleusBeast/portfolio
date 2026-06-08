"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { FileDown, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", isSection: false },
  { label: "About", href: "#about", isSection: true },
  { label: "Projects", href: "#projects", isSection: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const cv = useQuery(api.models.cv.get);
  const [activeItem, setActiveItem] = useState("/");

  useEffect(() => {
    if (!isHomePage) {
      setActiveItem(pathname === "/" ? "/" : "");
      return;
    }

    const updateActiveItem = () => {
      const aboutSection = document.getElementById("about");
      const projectsSection = document.getElementById("projects");
      const scrollPosition = window.scrollY + 140;

      if (projectsSection && scrollPosition >= projectsSection.offsetTop) {
        setActiveItem("#projects");
        return;
      }

      if (aboutSection && scrollPosition >= aboutSection.offsetTop) {
        setActiveItem("#about");
        return;
      }

      setActiveItem("/");
    };

    updateActiveItem();
    window.addEventListener("scroll", updateActiveItem, { passive: true });
    window.addEventListener("hashchange", updateActiveItem);

    return () => {
      window.removeEventListener("scroll", updateActiveItem);
      window.removeEventListener("hashchange", updateActiveItem);
    };
  }, [isHomePage, pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-90"
          >
            <Image src="/logo.png" alt="Logo" width={34} height={34} />
            <span className="hidden text-base font-semibold tracking-wide sm:inline-block">
              NucleusBeast
            </span>
          </Link>

          <ul className="flex items-center gap-5 border-b border-border/60 px-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={
                    item.isSection
                      ? isHomePage
                        ? item.href
                        : `/${item.href}`
                      : item.href
                  }
                  className={cn(
                    "inline-flex border-b-2 border-transparent px-1 py-2 text-base font-medium transition-colors",
                    activeItem === item.href
                      ? "border-primary text-foreground"
                      : "text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/NucleusBeast"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open NucleusBeast on GitHub"
            title="Open GitHub"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-accent"
          >
            <Github className="h-4 w-4" />
          </a>

          {cv?.url ? (
            <a
              href="/cv"
              download={cv.fileName}
              aria-label="Download CV"
              title="Download CV"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-accent"
            >
              <FileDown className="h-4 w-4" />
            </a>
          ) : null}

          <SignedOut>
            <Link
              href="/sign-in"
              className="ml-2 rounded-full border bg-background px-5 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-accent"
            >
              Sign In
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/admin/projects"
              className={cn(
                "ml-2 rounded-full px-5 py-2.5 text-base font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background text-foreground hover:bg-accent",
              )}
            >
              Admin
            </Link>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
