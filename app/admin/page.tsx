"use client";

import {createClient} from "@/utils/supabase/client";
import {Button} from "@/components/ui/button";
import React from "react";
import {useRouter} from "next/navigation";



export default function AdminPage() {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();

        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <div className={"justify-center items-center flex flex-col gap-4 mt-10"}>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <p>Welcome to the admin dashboard of the portfolio website!</p>

            <Button onClick={handleLogout}>
                Logout
            </Button>
        </div>
    );
}