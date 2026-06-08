"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Braces,
  Code2,
  Database,
  Globe,
  Layers3,
  Minus,
  Plus,
  Server,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type Skill = Doc<"skills">;

const categoryOrder = [
  "Language",
  "Framework",
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Tool",
  "Other",
] as const;

type SkillCategory = (typeof categoryOrder)[number];

const categoryMeta = {
  Language: {
    icon: Code2,
    tone: "border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
  },
  Framework: {
    icon: Layers3,
    tone: "border-sky-500/25 bg-sky-500/5 text-sky-700 dark:text-sky-300",
  },
  Frontend: {
    icon: Braces,
    tone: "border-fuchsia-500/25 bg-fuchsia-500/5 text-fuchsia-700 dark:text-fuchsia-300",
  },
  Backend: {
    icon: Server,
    tone: "border-indigo-500/25 bg-indigo-500/5 text-indigo-700 dark:text-indigo-300",
  },
  Database: {
    icon: Database,
    tone: "border-amber-500/25 bg-amber-500/5 text-amber-700 dark:text-amber-300",
  },
  DevOps: {
    icon: Globe,
    tone: "border-cyan-500/25 bg-cyan-500/5 text-cyan-700 dark:text-cyan-300",
  },
  Tool: {
    icon: Wrench,
    tone: "border-stone-500/25 bg-stone-500/5 text-stone-700 dark:text-stone-300",
  },
  Other: {
    icon: Sparkles,
    tone: "border-primary/25 bg-primary/5 text-primary",
  },
} satisfies Record<SkillCategory, { icon: typeof Code2; tone: string }>;

function normalizeCategory(category: string): SkillCategory {
  const key = category.trim().toLowerCase();

  if (["language", "programming", "coding"].includes(key)) {
    return "Language";
  }

  if (["framework", "frameworks", "library", "libraries"].includes(key)) {
    return "Framework";
  }

  if (["frontend", "front-end", "ui", "design", "web"].includes(key)) {
    return "Frontend";
  }

  if (["backend", "back-end", "api", "server"].includes(key)) {
    return "Backend";
  }

  if (["database", "data"].includes(key)) {
    return "Database";
  }

  if (["devops", "cloud", "hosting"].includes(key)) {
    return "DevOps";
  }

  if (["tool", "tools"].includes(key)) {
    return "Tool";
  }

  return "Other";
}

function levelLabel(level: number) {
  if (level >= 8) {
    return "Advanced";
  }

  if (level >= 5) {
    return "Working";
  }

  if (level >= 2) {
    return "Learning";
  }

  return "Starter";
}

function levelTone(level: number) {
  if (level >= 8) {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }

  if (level >= 5) {
    return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  }

  if (level >= 2) {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  return "bg-muted text-muted-foreground";
}

function sortSkills(a: Skill, b: Skill) {
  const levelCompare = b.level - a.level;

  if (levelCompare !== 0) {
    return levelCompare;
  }

  return a.name.localeCompare(b.name);
}

export default function SkillsPage() {
  const skills = useQuery(api.models.skills.get);
  const deleteSkill = useMutation(api.models.skills.deleteSkill);
  const updateSkillLevel = useMutation(api.models.skills.updateLevel);

  const groupedSkills = useMemo(() => {
    if (!skills) {
      return [];
    }

    const grouped: Record<SkillCategory, Skill[]> = {
      Language: [],
      Framework: [],
      Frontend: [],
      Backend: [],
      Database: [],
      DevOps: [],
      Tool: [],
      Other: [],
    };

    for (const skill of skills) {
      grouped[normalizeCategory(skill.category)].push(skill);
    }

    return categoryOrder
      .map((category) => {
        const items = grouped[category];

        return {
          category,
          items: [...items].sort(sortSkills),
          average:
            items.reduce((total, skill) => total + skill.level, 0) /
            items.length,
        };
      })
      .filter(({ items }) => items.length > 0)
      .sort((a, b) => {
        const orderCompare =
          categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);

        if (orderCompare !== 0) {
          return orderCompare;
        }

        return a.category.localeCompare(b.category);
      });
  }, [skills]);

  const totalSkills = skills?.length ?? 0;
  const topLevelCount = skills?.filter((skill) => skill.level >= 8).length ?? 0;

  if (skills?.length === 0) {
    return (
      <Empty>
        <EmptyTitle>No skills yet</EmptyTitle>
        <EmptyDescription>
          Add your first skill to showcase your expertise.
        </EmptyDescription>
        <Link href="/admin/skills/new">
          <Button className="mt-4">Add Skill</Button>
        </Link>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total skills</p>
          <strong className="mt-1 block text-2xl">{totalSkills}</strong>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Groups</p>
          <strong className="mt-1 block text-2xl">
            {groupedSkills.length}
          </strong>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Advanced</p>
          <strong className="mt-1 block text-2xl">{topLevelCount}</strong>
        </div>
      </section>

      {skills === undefined ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          Loading skills...
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {groupedSkills.map(({ category, items, average }) => {
            const meta = categoryMeta[category] ?? categoryMeta.Other;
            const Icon = meta.icon;

            return (
              <Card
                key={category}
                className="overflow-hidden border-border/80 shadow-none"
              >
                <CardHeader className="border-b bg-muted/25">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
                          meta.tone,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base">{category}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {items.length}{" "}
                          {items.length === 1 ? "skill" : "skills"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      Avg {average.toFixed(1)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((skill) => (
                      <div
                        key={skill._id}
                        className="group rounded-lg border bg-background p-3 transition-colors hover:bg-muted/35"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-medium">
                              {skill.name}
                            </h3>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "h-6 px-2 text-[11px]",
                                  levelTone(skill.level),
                                )}
                              >
                                {levelLabel(skill.level)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {skill.level}/10
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label={`Decrease ${skill.name} level`}
                              disabled={skill.level <= 0}
                              onClick={() =>
                                updateSkillLevel({
                                  id: skill._id,
                                  level: skill.level - 1,
                                })
                              }
                              className="h-8 w-8"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label={`Increase ${skill.name} level`}
                              disabled={skill.level >= 10}
                              onClick={() =>
                                updateSkillLevel({
                                  id: skill._id,
                                  level: skill.level + 1,
                                })
                              }
                              className="h-8 w-8"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete ${skill.name}`}
                              onClick={() => deleteSkill({ id: skill._id })}
                              className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.max(0, Math.min(skill.level, 10)) * 10}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
