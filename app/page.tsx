"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";
import { ProjectCarousel } from "@/components/project-carousel";

export default function Home() {
  const router = useRouter();
  const skills = useQuery(api.models.skills.get);
  const projects = useQuery(api.models.projects.list);

  const sortedSkills = skills
    ? [...skills].sort((a, b) => {
        const categoryCompare = a.category.localeCompare(b.category);
        if (categoryCompare !== 0) {
          return categoryCompare;
        }

        const levelCompare = b.level - a.level;
        if (levelCompare !== 0) {
          return levelCompare;
        }

        return a.name.localeCompare(b.name);
      })
    : [];

  const skillsByCategory = sortedSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }

      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, typeof sortedSkills>,
  );

  const categories = Object.keys(skillsByCategory);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">NucleusBeast portfolio!</h1>
        <p>
          I build polished web products with a strong focus on performance,
          clean architecture, and thoughtful UI.
        </p>
        <p>
          My work blends frontend engineering, backend integration, and visual
          design to create experiences that are both fast and memorable.
        </p>
      </section>

      <section id="about" className="scroll-mt-28 space-y-3">
        <h2 className="text-2xl font-semibold">About</h2>
        <p className="leading-7 text-muted-foreground">
          I am a Computer Programming and IPT student who enjoys turning ideas
          into products people actually want to use. I care about details that
          matter in production: maintainable code, intuitive interactions,
          reliable data flows, and clear communication throughout a project.
        </p>
        <p className="leading-7 text-muted-foreground">
          My typical stack includes Next.js, React, TypeScript, and Convex,
          and I enjoy shipping features end-to-end from planning and UX to
          implementation and deployment.
        </p>
        <p className="leading-7 text-muted-foreground">
          This site is my live portfolio and sandbox where I document my growth,
          publish projects, and continuously improve features like admin tools,
          media handling, and overall user experience.
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Skills</h2>
        {skills === undefined ? (
          <p className="text-muted-foreground">Loading skills...</p>
        ) : skills.length === 0 ? (
          <p className="text-muted-foreground">No skills added yet.</p>
        ) : (
          <div className="space-y-5">
            {categories.map((category) => (
              <Card key={category}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="font-semibold">{category}</h3>
                    <Badge variant="outline">
                      {skillsByCategory[category].length} skills
                    </Badge>
                  </div>

                  <div className="divide-y">
                    {skillsByCategory[category].map((skill, index) => (
                      <div
                        key={skill._id}
                        className="grid grid-cols-[50px_1fr_70px] items-center gap-3 px-4 py-3"
                      >
                        <div className="text-sm font-semibold text-muted-foreground">
                          #{index + 1}
                        </div>

                        <div className="space-y-2">
                          <p className="font-medium">{skill.name}</p>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(skill.level, 10) * 10}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge variant="secondary">{skill.level}/10</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section id="projects" className="scroll-mt-28 space-y-4">
        <h2 className="text-2xl font-semibold">Projects</h2>
        {projects === undefined ? (
          <p className="text-muted-foreground">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-muted-foreground">No projects added yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="cursor-pointer overflow-hidden transition-colors hover:border-primary/40"
                onClick={() => router.push(`/projects/${project._id}`)}
              >
                <div className="relative h-[220px] bg-muted">
                  <ProjectCarousel
                    imageUrls={project.imageUrls}
                    alt={project.title}
                    className="h-[220px]"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Visit
                    </a>
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Source
                      </a>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
