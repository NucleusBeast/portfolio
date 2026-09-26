"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { slugifyProjectTitle } from "@/lib/project-slug";

export default function AnalyticsPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [today, setToday] = useState(
    () => Math.floor(Date.now() / 86_400_000) * 86_400_000,
  );
  useEffect(() => {
    const timer = setInterval(
      () => setToday(Math.floor(Date.now() / 86_400_000) * 86_400_000),
      60_000,
    );
    return () => clearInterval(timer);
  }, []);
  const stats = useQuery(api.models.analytics.summary, { days, today });
  const cv = useQuery(api.models.cv.get);
  const maxViews = Math.max(1, ...(stats?.daily.map((d) => d.views) ?? []));
  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Portfolio traffic</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            See which projects catch attention and how often your CV is
            requested.
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm">
          Period
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value) as 7 | 30 | 90)}
            className="rounded-md border bg-background px-3 py-2"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>
      </div>
      {!stats ? (
        <output className="text-muted-foreground">Loading analytics…</output>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Visitors",
                value: stats.visitors,
                note: "Distinct anonymous browser sessions",
              },
              {
                label: "Page views",
                value: stats.views,
                note: "Home and project detail pages",
              },
              {
                label: "CV downloads",
                value: stats.downloads,
                note: "Successful file requests, all formats",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border p-6">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="my-3 text-4xl font-semibold tabular-nums">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
          <section
            className="rounded-xl border p-5 sm:p-6"
            aria-labelledby="traffic-heading"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <h3 id="traffic-heading" className="font-semibold">
                Daily page views
              </h3>
              <p className="text-xs text-muted-foreground">
                {stats.daily[0]?.date} — {stats.daily.at(-1)?.date} · UTC
              </p>
            </div>
            {stats.views === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">
                No visits recorded in this period yet. Tracking starts with this
                update; earlier traffic is not available.
              </p>
            ) : null}
            <div
              className="mt-6 flex h-40 items-end gap-1"
              role="img"
              aria-label={`Daily page views over ${days} days. ${stats.views} total. Exact values in the table below.`}
            >
              {stats.daily.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.views} views`}
                  className="min-w-0 flex-1 rounded-t bg-primary"
                  style={{
                    height: `${Math.max(day.views ? 3 : 0.5, (day.views / maxViews) * 100)}%`,
                    opacity: day.views ? 1 : 0.15,
                  }}
                />
              ))}
            </div>
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-muted-foreground">
                View daily counts
              </summary>
              <div className="mt-3 max-h-60 overflow-auto">
                <table className="w-full text-left">
                  <caption className="sr-only">Daily page views in UTC</caption>
                  <thead>
                    <tr>
                      <th className="py-2">Date</th>
                      <th className="py-2 text-right">Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.daily.map((day) => (
                      <tr key={day.date} className="border-t">
                        <td className="py-2">{day.date}</td>
                        <td className="py-2 text-right tabular-nums">
                          {day.views}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
          <section
            className="rounded-xl border p-5 sm:p-6"
            aria-labelledby="projects-heading"
          >
            <h3 id="projects-heading" className="font-semibold">
              Project interest
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Counts visits to each project’s detail page.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="pb-3">Project</th>
                    <th className="px-4 pb-3 text-right">Visitors</th>
                    <th className="pb-3 text-right">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.projects.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-4">
                        <Link
                          href={`/projects/${slugifyProjectTitle(p.title)}`}
                          className="underline underline-offset-4"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {p.visitors.toLocaleString()}
                      </td>
                      <td className="py-4 text-right tabular-nums">
                        {p.views.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {stats.projects.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Add a project to see its traffic here.
              </p>
            ) : null}
          </section>
          <section className="rounded-xl border p-5 sm:p-6">
            <h3 className="font-semibold">CV downloads by format</h3>
            {!cv?.url ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No CV is currently uploaded.{" "}
                <Link href="/admin/cv" className="underline">
                  Upload a CV
                </Link>{" "}
                to show the download button. Previous download counts are
                retained.
              </p>
            ) : null}
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              {stats.formats.map((f) => (
                <div key={f.format}>
                  <dt className="text-sm text-muted-foreground">
                    {f.format === "pdf"
                      ? "Main CV / PDF"
                      : f.format === "word"
                        ? "Word"
                        : "Pages"}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums">
                    {f.downloads.toLocaleString()}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <p className="max-w-3xl text-xs leading-6 text-muted-foreground">
            Visitors are distinct browser-tab sessions active during the
            selected period, an estimate rather than a count of individual
            people. Repeat page loads increase views. Admin visits, known bots,
            and browsers sending Do Not Track are excluded. No names, IP
            addresses, or cross-site identifiers are stored. CV downloads count
            successful file responses, not confirmation that the file was saved.
            Dates use UTC.
          </p>
        </>
      )}
    </div>
  );
}
