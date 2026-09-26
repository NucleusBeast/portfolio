"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useSessionId } from "convex-helpers/react/sessions";
import { useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function PageAnalytics({ projectId }: { projectId?: Id<"projects"> }) {
  const [sessionId] = useSessionId();
  const { isLoading } = useConvexAuth();
  const isAdmin = useQuery(api.models.admins.currentUserIsAdmin);
  const record = useMutation(api.models.analytics.record);
  const sent = useRef<string | null>(null);
  useEffect(() => {
    if (
      isLoading ||
      !sessionId ||
      isAdmin !== false ||
      navigator.doNotTrack === "1" ||
      /bot|crawler|spider|headless/i.test(navigator.userAgent)
    )
      return;
    const key = `${sessionId}:${projectId ?? "home"}`;
    if (sent.current === key) return;
    const send = () => {
      if (document.visibilityState !== "visible" || sent.current === key)
        return;
      sent.current = key;
      void record({
        sessionId,
        eventId: crypto.randomUUID(),
        kind: "page",
        projectId,
      }).catch(() => {
        if (sent.current === key) sent.current = null;
      });
    };
    send();
    document.addEventListener("visibilitychange", send);
    return () => document.removeEventListener("visibilitychange", send);
  }, [sessionId, isAdmin, isLoading, projectId, record]);
  return null;
}

export function useCvHref(path = "/cv") {
  const [sessionId] = useSessionId();
  return sessionId ? `${path}?sid=${encodeURIComponent(sessionId)}` : path;
}
