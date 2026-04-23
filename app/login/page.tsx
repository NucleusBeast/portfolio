"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sign-in");
  }, [router]);

  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-12">
      <div className="text-muted-foreground">Redirecting to sign in...</div>
    </main>
  );
}
