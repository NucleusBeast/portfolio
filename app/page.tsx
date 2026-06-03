"use client";

import { useQuery } from "convex/react";
import {
  ArrowUpRight,
  Boxes,
  Braces,
  Code2,
  ExternalLink,
  Gauge,
  GitBranch,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ProjectCarousel } from "@/components/project-carousel";
import { api } from "@/convex/_generated/api";

const metrics = [
  { label: "Stack focus", value: "Next.js", icon: Code2 },
  { label: "Data layer", value: "Convex", icon: GitBranch },
  { label: "Build mode", value: "End-to-end", icon: Boxes },
];

export default function Home() {
  const router = useRouter();
  const skills = useQuery(api.models.skills.get);
  const projects = useQuery(api.models.projects.list);

  const sortedSkills = useMemo(
    () =>
      skills
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
        : [],
    [skills],
  );

  const topSkills = sortedSkills.slice(0, 8);
  const categories = useMemo(() => {
    const grouped = sortedSkills.reduce(
      (acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
      },
      {} as Record<string, typeof sortedSkills>,
    );

    return Object.entries(grouped).slice(0, 6);
  }, [sortedSkills]);

  return (
    <main className="blueprint-page min-h-screen">
      <section className="blueprint-shell blueprint-hero">
        <div className="blueprint-hero-copy">
          <div className="blueprint-kicker">
            <Braces className="h-4 w-4" />
            Blueprint studio
          </div>
          <h1>From rough idea to working product, mapped with intent.</h1>
          <p>
            A precise technical portfolio for full-stack builds, UI systems, and
            project artifacts. Grid lines, measurements, and shipping details
            stay visible because the craft matters.
          </p>
          <div className="blueprint-actions">
            <a href="#projects" className="blueprint-primary-action">
              View projects
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href="#skills" className="blueprint-secondary-action">
              Skill map
            </a>
          </div>
        </div>

        <div
          className="blueprint-hero-panel"
          role="img"
          aria-label="Portfolio snapshot"
        >
          <div className="blueprint-panel-top">
            <span>NucleusBeast</span>
            <span>Build yellow</span>
          </div>
          <div className="blueprint-signal">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="blueprint-metric-grid">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div className="blueprint-metric" key={metric.label}>
                  <Icon className="h-4 w-4" />
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              );
            })}
          </div>
          <div className="blueprint-terminal-strip">
            <span>ship</span>
            <span>design</span>
            <span>integrate</span>
          </div>
        </div>
      </section>

      <section className="blueprint-shell blueprint-about" id="about">
        <div>
          <p className="blueprint-section-label">About</p>
          <h2>Practical engineering with visible taste.</h2>
        </div>
        <div className="blueprint-about-copy">
          <p>
            I am a Computer Programming and IPT student who enjoys turning ideas
            into products people actually want to use.
          </p>
          <p>
            My typical stack includes Next.js, React, TypeScript, and Convex. I
            like owning the path from planning and UX to implementation,
            deployment, and the polish that makes a product feel alive.
          </p>
        </div>
      </section>

      <section className="blueprint-shell blueprint-skills" id="skills">
        <div className="blueprint-section-head">
          <div>
            <p className="blueprint-section-label">Skills</p>
            <h2>Capability map</h2>
          </div>
          <Gauge className="h-6 w-6" />
        </div>

        {skills === undefined ? (
          <p className="blueprint-muted">Loading skills...</p>
        ) : skills.length === 0 ? (
          <p className="blueprint-muted">No skills added yet.</p>
        ) : (
          <div className="blueprint-skill-layout">
            <div className="blueprint-top-skills">
              {topSkills.map((skill, index) => (
                <div className="blueprint-skill-row" key={skill._id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{skill.name}</strong>
                  <div>
                    <i
                      style={{ width: `${Math.min(skill.level, 10) * 10}%` }}
                    />
                  </div>
                  <em>{skill.level}/10</em>
                </div>
              ))}
            </div>

            <div className="blueprint-category-grid">
              {categories.map(([category, items]) => (
                <div className="blueprint-category" key={category}>
                  <span>{category}</span>
                  <strong>{items.length}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="blueprint-shell blueprint-projects" id="projects">
        <div className="blueprint-section-head">
          <div>
            <p className="blueprint-section-label">Projects</p>
            <h2>Recent builds</h2>
          </div>
        </div>

        {projects === undefined ? (
          <p className="blueprint-muted">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="blueprint-muted">No projects added yet.</p>
        ) : (
          <div className="blueprint-project-grid">
            {projects.map((project) => (
              <article className="blueprint-project" key={project._id}>
                <div className="blueprint-project-media">
                  <ProjectCarousel
                    imageUrls={project.imageUrls}
                    alt={project.title}
                    className="h-full"
                  />
                </div>
                <div className="blueprint-project-body">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="blueprint-project-links">
                    <button
                      type="button"
                      onClick={() => router.push(`/projects/${project._id}`)}
                    >
                      Details
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Source
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
