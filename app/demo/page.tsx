"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/admin/projects");
    }, [router]);

    return (
        <main className="flex min-h-[calc(100vh-65px)] items-center justify-center">
            <div className="text-muted-foreground">Redirecting...</div>
        </main>
    );
}