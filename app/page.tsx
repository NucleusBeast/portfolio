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
import Link from "next/link";
import { useMemo } from "react";
import { PageAnalytics, useCvHref } from "@/components/page-analytics";
import { ProjectCarousel } from "@/components/project-carousel";
import { api } from "@/convex/_generated/api";
import { slugifyProjectTitle } from "@/lib/project-slug";
import { defaultSiteContent } from "@/lib/site-content";

const metrics = [
  { label: "Stack focus", value: "Next.js", icon: Code2 },
  { label: "Data layer", value: "Convex", icon: GitBranch },
  { label: "Build mode", value: "End-to-end", icon: Boxes },
];

export default function Home() {
  const content = useQuery(api.models.siteContent.get) ?? defaultSiteContent;
  const cv = useQuery(api.models.cv.get);
  const cvHref = useCvHref();
  const skills = useQuery(api.models.skills.get);
  const projects = useQuery(api.models.projects.list, { landingOnly: true });

  const sortedSkills = useMemo(
    () =>
      skills
        ? [...skills].sort((a, b) => {
            const levelCompare = b.level - a.level;
            if (levelCompare !== 0) {
              return levelCompare;
            }

            return a.name.localeCompare(b.name);
          })
        : [],
    [skills],
  );

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
      <PageAnalytics />
      <section className="blueprint-shell blueprint-hero">
        <div className="blueprint-hero-copy">
          <div className="blueprint-kicker">
            <Braces className="h-4 w-4" />
            Software engineer · Developer · Creator
          </div>
          <h1>Hi, I’m Filip. I turn ideas into software.</h1>
          <p>
            I’m a software engineer from Slovenia who enjoys building things,
            exploring new technologies, and solving interesting problems. From
            web and mobile applications to Minecraft mods, I like bringing ideas
            to life.
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
          <p className="blueprint-section-label">{content.aboutEyebrow}</p>
          <h2>{content.aboutHeading}</h2>
        </div>
        <div className="blueprint-about-copy">
          {content.aboutBody.split(/\n\s*\n/).map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 30)}`}>{paragraph}</p>
          ))}
        </div>
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
                    <Link
                      href={`/projects/${slugifyProjectTitle(project.title)}`}
                    >
                      Details
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
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

      <section className="blueprint-shell blueprint-skills" id="skills">
        <div className="blueprint-section-head">
          <div>
            <p className="blueprint-section-label">Skills</p>
            <h2>My favourite/preferred tools</h2>
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
              {sortedSkills.map((skill, index) => (
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
      <section className="blueprint-shell blueprint-about" id="contact">
        <div>
          <p className="blueprint-section-label">{content.contactEyebrow}</p>
          <h2>{content.contactHeading}</h2>
        </div>
        <div className="blueprint-about-copy">
          <p>{content.contactBody}</p>
          <p className="text-sm">
            Based in {content.location} · Full-stack, mobile & game development
          </p>
          <div className="blueprint-actions">
            <a
              className="blueprint-primary-action"
              href={`mailto:${content.contactEmail}?subject=${encodeURIComponent("Software engineering opportunity")}`}
            >
              Email me <ArrowUpRight className="h-4 w-4" />
            </a>
            {cv?.url ? (
              <a
                className="blueprint-secondary-action"
                href={cvHref}
                download={cv.fileName}
              >
                Download CV
              </a>
            ) : null}
            <a
              className="blueprint-secondary-action"
              href={content.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <a
            className="text-sm underline underline-offset-4 break-all"
            href={`mailto:${content.contactEmail}`}
          >
            {content.contactEmail}
          </a>
        </div>
      </section>
      <footer className="blueprint-shell border-t py-8 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} NucleusBeast · Building useful things.
        </p>
        <p className="mt-2 text-xs">
          Anonymous session analytics help improve this portfolio. No names or
          IP addresses are stored. Do Not Track is respected.
        </p>
      </footer>
    </main>
  );
}
