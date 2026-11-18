"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Flow = "signIn" | "signUp";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [flow, setFlow] = useState<Flow>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.set("flow", flow);

    try {
      await signIn("password", formData);
      router.replace("/admin/projects");
    } catch {
      setError(
        flow === "signIn"
          ? "Incorrect email or password."
          : "Could not create the account. Only admin emails can sign up, and the password must have at least 8 characters.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-background px-4 py-12 text-foreground">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle>
            {flow === "signIn" ? "Sign in" : "Create account"}
          </CardTitle>
          <CardDescription>
            {flow === "signIn"
              ? "Sign in to manage your portfolio."
              : "Only admin emails can create an account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  flow === "signIn" ? "current-password" : "new-password"
                }
                minLength={8}
                required
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait..."
                : flow === "signIn"
                  ? "Sign in"
                  : "Create account"}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setFlow(flow === "signIn" ? "signUp" : "signIn");
                setError(null);
              }}
            >
              {flow === "signIn"
                ? "No account yet? Create one"
                : "Have an account? Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
