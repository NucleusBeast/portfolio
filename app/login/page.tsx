"use client";

import React from "react"

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {LockKeyhole, User} from "lucide-react";

import {useAuthActions} from "@convex-dev/auth/react";
import {api} from "@/convex/_generated/api";
import {useQuery} from "convex/react";


export default function AdminLoginPage() {
    const router = useRouter();


    const {signIn} = useAuthActions();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [step, setStep] = useState<"signIn" | "signUp">("signIn");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const handleLogin = async (e: React.FormEvent) => {
        setStep("signIn")
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await signIn("password", {email, password, flow: step});
        } catch (err) {
            setError("Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    // for creating an admin account on prod
    const admins = useQuery(api.models.admins.get);
    const isAdminAccount = () => {

        for (let admin of admins!) {
            if (admin.email === email) {
                return true;
            }
        }

        return false;
    };

    return (
        <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <LockKeyhole className="h-6 w-6 text-primary"/>
                    </div>
                    <CardTitle className="text-2xl font-semibold">Admin Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the admin panel
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username">Email</Label>
                            <div className="relative">
                                <User
                                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter username"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <LockKeyhole
                                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                        {
                            isAdminAccount()
                                ? <Button type="submit" className="w-full mt-2" disabled={isLoading} onClick={
                                    () =>  setStep("signUp")
                                }>
                                    {isLoading ? "Signing up the admin..." : "Sign Up the Admin"}
                                </Button>
                                : <></>
                        }
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}