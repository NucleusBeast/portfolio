"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import { StatusBar } from "@/components/status-bar";

export function SiteChrome() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Navbar />
      <StatusBar />
    </>
  );
}
