"use client";

import { useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Github,
  Images,
  Ruler,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProjectImageFrame } from "@/components/project-carousel";
import { ProjectDetailSkeleton } from "@/components/project-detail-skeleton";
import { api } from "@/convex/_generated/api";
import { slugifyProjectTitle } from "@/lib/project-slug";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const projectSlug = params.id;
  const projects = useQuery(api.models.projects.list);
  const project = useMemo(
    () =>
      projects?.find(
        (projectItem) =>
          projectItem._id === projectSlug ||
          slugifyProjectTitle(projectItem.title) === projectSlug,
      ) ?? null,
    [projects, projectSlug],
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    void projectSlug;
    setActiveImageIndex(0);
  }, [projectSlug]);

  if (projects === undefined) {
    return <ProjectDetailSkeleton />;
  }

  if (project === null) {
    return (
      <main className="blueprint-page min-h-screen">
        <div className="blueprint-shell blueprint-detail-status">
          <Link href="/" className="blueprint-detail-back">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <p className="blueprint-muted">Project not found.</p>
        </div>
      </main>
    );
  }

  const hasImages = project.imageUrls.length > 0;
  const safeIndex = hasImages
    ? Math.min(activeImageIndex, project.imageUrls.length - 1)
    : 0;

  return (
    <main className="blueprint-page min-h-screen">
      <section className="blueprint-shell blueprint-detail">
        <Link href="/" className="blueprint-detail-back">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="blueprint-detail-hero">
          <div>
            <div className="blueprint-kicker">
              <Ruler className="h-4 w-4" />
              Project sheet
            </div>
            <h1>{project.title}</h1>
          </div>

          <div className="blueprint-detail-summary">
            <p>{project.description}</p>
            <div className="blueprint-detail-actions">
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  Visit project
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View source
                  <Github className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        </header>

        <div className="blueprint-detail-layout">
          <section className="blueprint-detail-media">
            <div className="blueprint-detail-media-top">
              <span>Frame {String(safeIndex + 1).padStart(2, "0")}</span>
              <span>{project.imageUrls.length} captures</span>
            </div>
            <div className="blueprint-detail-frame">
              {hasImages ? (
                <ProjectImageFrame
                  src={project.imageUrls[safeIndex]}
                  alt={`${project.title} image ${safeIndex + 1}`}
                  width={1400}
                  height={900}
                />
              ) : (
                <div className="blueprint-detail-empty">
                  <Images className="h-12 w-12" />
                  No images uploaded
                </div>
              )}
            </div>

            {project.imageUrls.length > 1 ? (
              <div className="blueprint-detail-thumbs">
                {project.imageUrls.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    type="button"
                    className={`blueprint-detail-thumb ${
                      index === safeIndex ? "blueprint-detail-thumb-active" : ""
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
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <aside className="blueprint-detail-spec">
            <div className="blueprint-detail-spec-head">
              <span>Build notes</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <dl>
              <div>
                <dt>Gallery</dt>
                <dd>{project.imageUrls.length || "No"} images</dd>
              </div>
              <div>
                <dt>Live URL</dt>
                <dd>{project.url ? "Available" : "Not attached"}</dd>
              </div>
              <div>
                <dt>Repository</dt>
                <dd>{project.githubUrl ? "Available" : "Not attached"}</dd>
              </div>
            </dl>

            <div className="blueprint-detail-description">
              <span>Description</span>
              <p>{project.description}</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
