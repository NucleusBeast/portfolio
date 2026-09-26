"use client";
import { Button } from "@/components/ui/button";
export default function AnalyticsError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="space-y-4">
      <h2 className="text-lg font-semibold">Analytics could not load</h2>
      <p className="text-muted-foreground">
        Check your connection and try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
