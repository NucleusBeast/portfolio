import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type React from "react";
import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import { ModeToggle } from "@/components/mode-toggle";
import { SiteChrome } from "@/components/site-chrome";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NB - Portfolio",
  description: "Portfolio of NucleusBeast",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider
      publishableKey={
        publishableKey || "pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk"
      }
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <SiteChrome />
              {children}
            </ConvexClientProvider>
            <div className="fixed bottom-4 right-4">
              <ModeToggle />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
