import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-background px-4 py-12 text-foreground">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/"
        appearance={{
          elements: {
            card: "border border-border bg-card text-card-foreground shadow-xl",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton:
              "border-border bg-background text-foreground shadow-sm hover:bg-accent",
            socialButtonsBlockButtonText:
              "font-medium text-foreground opacity-100",
            formFieldLabel: "text-foreground",
            formFieldInput:
              "border-input bg-background text-foreground placeholder:text-muted-foreground",
            footerActionText: "text-muted-foreground",
            footerActionLink: "text-primary",
          },
          variables: {
            colorBackground: "var(--card)",
            colorInputBackground: "var(--background)",
            colorInputText: "var(--foreground)",
            colorPrimary: "var(--primary)",
            colorText: "var(--foreground)",
            colorTextSecondary: "var(--muted-foreground)",
          },
        }}
      />
    </main>
  );
}
