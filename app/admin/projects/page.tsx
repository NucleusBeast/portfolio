"use client";

import { useMutation, useQuery } from "convex/react";
import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectCarousel } from "@/components/project-carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { slugifyProjectTitle } from "@/lib/project-slug";

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useQuery(api.models.projects.list, {});
  const setVisibility = useMutation(api.models.projects.setVisibility);
  const [pendingIds, setPendingIds] = useState<Set<Id<"projects">>>(new Set());
  const [error, setError] = useState("");

  async function toggleVisibility(id: Id<"projects">, visible: boolean) {
    setError("");
    setPendingIds((current) => new Set(current).add(id));
    try {
      await setVisibility({ id, showOnLandingPage: visible });
    } catch {
      setError("Could not change project visibility. Please try again.");
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  const removeProject = useMutation(api.models.projects.remove);

  if (projects === undefined) {
    return <div className="text-muted-foreground">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <Empty>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Create your first project to get started.
        </EmptyDescription>
        <Link href="/admin/projects/new">
          <Button className="mt-4">Create Project</Button>
        </Link>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project._id}
            className="group cursor-pointer overflow-hidden"
            onClick={() => router.push(`/admin/projects/${project._id}`)}
          >
            <div className="relative h-[220px] bg-muted">
              <ProjectCarousel
                imageUrls={project.imageUrls}
                alt={project.title}
                className="h-[220px]"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    router.push(
                      `/projects/${slugifyProjectTitle(project.title)}`,
                    );
                  }}
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void removeProject({ id: project._id });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{project.title}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                role="switch"
                aria-checked={project.showOnLandingPage !== false}
                aria-label={`Show ${project.title} on landing page`}
                disabled={pendingIds.has(project._id)}
                onClick={(event) => {
                  event.stopPropagation();
                  void toggleVisibility(
                    project._id,
                    project.showOnLandingPage === false,
                  );
                }}
              >
                {project.showOnLandingPage === false
                  ? "Hidden from landing page"
                  : "Shown on landing page"}
              </Button>
              {project.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  View Project
                </a>
              )}
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 ml-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  Source
                </a>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
