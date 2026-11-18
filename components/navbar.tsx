"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { FileDown, FileText, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCvHref } from "@/components/page-analytics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { tuiSections, useActiveSection } from "@/components/use-active-section";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const cvHref = useCvHref();
  const wordHref = useCvHref("/cv/word");
  const pagesHref = useCvHref("/cv/pages");
  const cv = useQuery(api.models.cv.get);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const activeItem = useActiveSection(isHomePage);

  return (
    <header className="tui-topbar">
      <nav className="tui-shell tui-topbar-inner" aria-label="Main">
        <div className="tui-topbar-left">
          <Link href="/" className="tui-brand">
            <Image src="/logo.png" alt="Logo" width={22} height={22} />
            <span>nucleusbeast</span>
          </Link>

          <ul className="tui-tabs">
            {tuiSections.map((item) => (
              <li key={item.href}>
                <Link
                  href={
                    item.id ? (isHomePage ? item.href : `/${item.href}`) : "/"
                  }
                  className={cn(
                    "tui-tab",
                    activeItem === item.href && "tui-tab-active",
                  )}
                  aria-current={activeItem === item.href ? "true" : undefined}
                >
                  <span className="tui-tab-key">{item.key}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="tui-topbar-actions">
          <a
            href="https://github.com/NucleusBeast"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open NucleusBeast on GitHub"
            title="Open GitHub"
            className="tui-icon-btn"
          >
            <Github className="h-4 w-4" />
          </a>

          {cv?.url ? (
            <a
              href={cvHref}
              download={cv.fileName}
              aria-label="Download CV"
              title="Download CV"
              className="tui-icon-btn"
            >
              <FileDown className="h-4 w-4" />
            </a>
          ) : null}

          {isAuthenticated && (cv?.wordUrl || cv?.pagesUrl) ? (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Download editable CV"
                  title="Download editable CV"
                  className="tui-icon-btn"
                >
                  <FileText className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Download editable CV</DialogTitle>
                  <DialogDescription>
                    Choose the file format you want to download.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  {cv?.wordUrl ? (
                    <Button asChild variant="outline">
                      <a
                        href={wordHref}
                        download={cv.wordFileName ?? "cv.docx"}
                      >
                        <FileText className="h-4 w-4" />
                        Word document
                      </a>
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" disabled>
                      <FileText className="h-4 w-4" />
                      Word document unavailable
                    </Button>
                  )}
                  {cv?.pagesUrl ? (
                    <Button asChild variant="outline">
                      <a
                        href={pagesHref}
                        download={cv.pagesFileName ?? "cv.pages"}
                      >
                        <FileText className="h-4 w-4" />
                        macOS Pages document
                      </a>
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" disabled>
                      <FileText className="h-4 w-4" />
                      macOS Pages document unavailable
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ) : null}

          {!isAuthLoading && !isAuthenticated ? (
            <Link href="/sign-in" className="tui-text-btn">
              sign-in
            </Link>
          ) : null}
          {isAuthenticated ? (
            <Link
              href="/admin/projects"
              className={cn(
                "tui-text-btn",
                pathname.startsWith("/admin") && "tui-text-btn-active",
              )}
            >
              admin
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
