"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageAnalytics } from "@/components/page-analytics";
import { ProjectImageFrame } from "@/components/project-carousel";
import { ProjectDetailSkeleton } from "@/components/project-detail-skeleton";
import { TuiBox } from "@/components/tui-box";
import { api } from "@/convex/_generated/api";
import { slugifyProjectTitle } from "@/lib/project-slug";
import { cn } from "@/lib/utils";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const projectSlug = params.id;
  const projects = useQuery(api.models.projects.list, {});
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
      <main className="tui-page">
        <div className="tui-shell tui-detail">
          <Link href="/" className="tui-button">
            ← cd ..
          </Link>
          <p className="tui-error">
            cat: projects/{projectSlug}: No such file or directory
          </p>
        </div>
      </main>
    );
  }

  const hasImages = project.imageUrls.length > 0;
  const safeIndex = hasImages
    ? Math.min(activeImageIndex, project.imageUrls.length - 1)
    : 0;
  const frameLabel = String(safeIndex + 1).padStart(2, "0");
  const frameTotal = String(project.imageUrls.length).padStart(2, "0");

  return (
    <main className="tui-page">
      <PageAnalytics key={project._id} projectId={project._id} />
      <section className="tui-shell tui-detail">
        <Link href="/#projects" className="tui-button">
          ← cd ..
        </Link>

        <header className="tui-detail-hero">
          <p className="tui-comment">{"// project sheet"}</p>
          <h1>
            <span className="tui-hash">#</span> {project.title}
          </h1>
          <p className="tui-hero-copy">{project.description}</p>
          <div className="tui-actions">
            {project.url ? (
              <a
                className="tui-button tui-button-primary"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                visit project ↗
              </a>
            ) : null}
            {project.githubUrl ? (
              <a
                className="tui-button"
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                view source ↗
              </a>
            ) : null}
          </div>
        </header>

        <div className="tui-detail-layout">
          <TuiBox
            as="section"
            title={hasImages ? `frame ${frameLabel}/${frameTotal}` : "frame --"}
            meta={`${project.imageUrls.length} captures`}
            bodyClassName="tui-detail-media"
          >
            <div className="tui-detail-frame">
              {hasImages ? (
                <ProjectImageFrame
                  src={project.imageUrls[safeIndex]}
                  alt={`${project.title} image ${safeIndex + 1}`}
                  width={1400}
                  height={900}
                />
              ) : (
                <div className="tui-detail-empty">
                  <pre aria-hidden="true">{"[ no signal ]"}</pre>
                  No images uploaded
                </div>
              )}
            </div>

            {project.imageUrls.length > 1 ? (
              <div className="tui-detail-thumbs">
                {project.imageUrls.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    type="button"
                    className={cn(
                      "tui-detail-thumb",
                      index === safeIndex && "tui-detail-thumb-active",
                    )}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-pressed={index === safeIndex}
                  >
                    <Image
                      src={imageUrl}
                      alt=""
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
          </TuiBox>

          <TuiBox as="aside" title="build-notes" meta="spec">
            <dl className="tui-spec">
              <div>
                <dt>gallery</dt>
                <dd>{project.imageUrls.length || "no"} images</dd>
              </div>
              <div>
                <dt>live_url</dt>
                <dd className={project.url ? "tui-ok" : "tui-off"}>
                  {project.url ? "available" : "not attached"}
                </dd>
              </div>
              <div>
                <dt>repository</dt>
                <dd className={project.githubUrl ? "tui-ok" : "tui-off"}>
                  {project.githubUrl ? "available" : "not attached"}
                </dd>
              </div>
            </dl>
            <div className="tui-spec-desc">
              <p className="tui-comment"># description</p>
              <p>{project.description}</p>
            </div>
          </TuiBox>
        </div>
      </section>
    </main>
  );
}
