"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id as Id<"projects">;
  const project = useQuery(api.models.projects.getById, { id: projectId });
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    void projectId;
    setActiveImageIndex(0);
  }, [projectId]);

  if (project === undefined) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-muted-foreground">Loading project...</p>
      </main>
    );
  }

  if (project === null) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-muted-foreground">Project not found.</p>
      </main>
    );
  }

  const hasImages = project.imageUrls.length > 0;
  const safeIndex = hasImages
    ? Math.min(activeImageIndex, project.imageUrls.length - 1)
    : 0;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <section className="space-y-8">
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{project.title}</h1>
            <Badge variant="secondary">{project.imageUrls.length} images</Badge>
          </div>
          {project.url || project.githubUrl ? (
            <div className="flex flex-wrap gap-3">
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  <Button>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Project
                  </Button>
                </a>
              ) : null}
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Source
                  </Button>
                </a>
              ) : null}
            </div>
          ) : null}
        </header>

        <div className="space-y-4">
          <div className="relative h-[520px] overflow-hidden rounded-xl border bg-muted">
            {hasImages ? (
              <Image
                src={project.imageUrls[safeIndex]}
                alt={`${project.title} image ${safeIndex + 1}`}
                width={1400}
                height={900}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No images uploaded
              </div>
            )}
          </div>

          {project.imageUrls.length > 1 ? (
            <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
              {project.imageUrls.map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  type="button"
                  className={`relative h-20 overflow-hidden rounded-md border transition ${
                    index === safeIndex
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <Image
                    src={imageUrl}
                    alt={`${project.title} thumbnail ${index + 1}`}
                    width={240}
                    height={160}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="leading-7 text-muted-foreground">
            {project.description}
          </p>
        </section>
      </section>
    </main>
  );
}
