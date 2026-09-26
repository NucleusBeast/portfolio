"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { SiteContent } from "@/lib/site-content";

export default function AboutAdminPage() {
  const content = useQuery(api.models.siteContent.get);
  if (!content)
    return <p className="text-muted-foreground">Loading content…</p>;
  return <ContentEditor initial={content} />;
}

function ContentEditor({ initial }: { initial: SiteContent }) {
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const save = useMutation(api.models.siteContent.save);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const field = (
    key: keyof SiteContent,
    label: string,
    multiline = false,
    type = "text",
  ) => (
    <div className="space-y-2" key={key}>
      <Label htmlFor={key}>{label}</Label>
      {multiline ? (
        <Textarea
          id={key}
          rows={key === "aboutBody" ? 9 : 4}
          maxLength={6000}
          required
          value={draft[key]}
          onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        />
      ) : (
        <Input
          id={key}
          type={type}
          maxLength={200}
          required
          value={draft[key]}
          onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        />
      )}
    </div>
  );
  return (
    <form
      className="max-w-3xl space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
          await save(draft);
          setSaved(draft);
          setMessage(
            "Saved. Your About and Contact sections are now updated on the site.",
          );
        } catch {
          setError(
            "Could not save. Check that every field is filled, the email is valid, and the GitHub link starts with https://github.com/.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <h2 className="text-xl font-semibold">About & Contact</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit the sections on your home page. Saved changes appear immediately.
        </p>
      </div>
      <fieldset
        disabled={busy}
        className="space-y-5 rounded-xl border p-5 sm:p-6"
      >
        <legend className="px-2 font-semibold">About you</legend>
        {field("aboutEyebrow", "Section label")}
        {field("aboutHeading", "About heading")}
        {field("aboutBody", "About text", true)}
        <p className="text-sm text-muted-foreground">
          Separate paragraphs with a blank line.
        </p>
      </fieldset>
      <fieldset
        disabled={busy}
        className="space-y-5 rounded-xl border p-5 sm:p-6"
      >
        <legend className="px-2 font-semibold">Recruiter contact</legend>
        {field("contactEyebrow", "Contact section label")}
        {field("contactHeading", "Contact heading")}
        {field("contactBody", "Contact text", true)}
        {field("contactEmail", "Contact email", false, "email")}
        {field("githubUrl", "GitHub profile", false, "url")}
        {field("location", "Location")}
        <p className="text-sm text-muted-foreground">
          The Download CV button appears automatically when a CV is uploaded in
          the CV tab.
        </p>
      </fieldset>
      {error ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : null}
      <output className="text-sm text-muted-foreground">
        {dirty ? "You have unsaved changes." : message}
      </output>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!dirty || busy}
          onClick={() => {
            setDraft(saved);
            setError("");
          }}
        >
          Discard edits
        </Button>
        <a
          href="/#about"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 text-sm underline underline-offset-4"
        >
          View on site ↗
        </a>
      </div>
    </form>
  );
}
