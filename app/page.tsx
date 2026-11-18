"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { type ReactNode, useMemo } from "react";
import { PageAnalytics, useCvHref } from "@/components/page-analytics";
import { ProjectCarousel } from "@/components/project-carousel";
import { TuiBar, TuiBox } from "@/components/tui-box";
import { api } from "@/convex/_generated/api";
import { slugifyProjectTitle } from "@/lib/project-slug";
import { defaultSiteContent } from "@/lib/site-content";

const asciiLogo = String.raw` _   _ ____
| \ | | __ )
|  \| |  _ \
| |\  | |_) |
|_| \_|____/`;

const sysinfo = [
  { label: "user", value: "nucleusbeast" },
  { label: "role", value: "software engineer" },
  { label: "stack", value: "Next.js · TypeScript" },
  { label: "data", value: "Convex" },
  { label: "mode", value: "end-to-end" },
];

const processes = [
  { name: "ship", value: 9 },
  { name: "design", value: 7 },
  { name: "integrate", value: 8 },
];

const paletteVars = [
  "--tui-panel-2",
  "--tui-red",
  "--tui-green",
  "--tui-accent-2",
  "--tui-accent",
  "--tui-purple",
  "--tui-muted",
  "--tui-fg",
];

function Prompt({ children }: { children: ReactNode }) {
  return (
    <p className="tui-prompt">
      <span className="tui-prompt-user">nucleusbeast@portfolio</span>
      <span className="tui-prompt-sep">:</span>
      <span className="tui-prompt-path">~</span>
      <span className="tui-prompt-sep">$ </span>
      {children}
    </p>
  );
}

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
    <main className="tui-page">
      <PageAnalytics />

      <section className="tui-shell tui-hero">
        <TuiBox title="~/whoami" meta="zsh" className="tui-hero-main">
          <Prompt>whoami</Prompt>
          <p className="tui-comment">
            # Software engineer · Developer · Creator
          </p>
          <h1 className="tui-hero-title">
            Hi, I’m NucleusBeast. I turn ideas into software.
          </h1>
          <p className="tui-hero-copy">
            I’m a software engineer from Slovenia who enjoys building things,
            exploring new technologies, and solving interesting problems. From
            web and mobile applications to Minecraft mods, I like bringing ideas
            to life.
          </p>
          <div className="tui-actions">
            <a href="#projects" className="tui-button tui-button-primary">
              view projects →
            </a>
            <a href="#skills" className="tui-button">
              skill map
            </a>
          </div>
          <Prompt>
            <span className="tui-cursor" aria-hidden="true" />
          </Prompt>
        </TuiBox>

        <TuiBox
          title="neofetch"
          meta="sysinfo"
          className="tui-hero-side"
          aria-label="Portfolio snapshot"
        >
          <div className="tui-fetch">
            <pre className="tui-ascii" aria-hidden="true">
              {asciiLogo}
            </pre>
            <dl className="tui-fetch-info">
              <div className="tui-fetch-host">
                <span>nucleusbeast</span>@<span>portfolio</span>
              </div>
              <div className="tui-fetch-rule" aria-hidden="true">
                ──────────────────
              </div>
              {sysinfo.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
              <div>
                <dt>locale</dt>
                <dd>{content.location}</dd>
              </div>
            </dl>
          </div>

          <div className="tui-procs">
            {processes.map((proc) => (
              <div className="tui-proc" key={proc.name}>
                <span>{proc.name}</span>
                <TuiBar value={proc.value} cells={16} />
                <em>{proc.value * 10}%</em>
              </div>
            ))}
          </div>

          <div className="tui-palette" aria-hidden="true">
            {paletteVars.map((color) => (
              <i key={color} style={{ background: `var(${color})` }} />
            ))}
          </div>
        </TuiBox>
      </section>

      <section className="tui-shell tui-section" id="about">
        <header className="tui-section-head">
          <p className="tui-comment">
            {"// "}
            {content.aboutEyebrow}
          </p>
          <h2>
            <span className="tui-hash">##</span> {content.aboutHeading}
          </h2>
        </header>
        <TuiBox title="about.md" meta="read-only">
          <div className="tui-prose">
            {content.aboutBody.split(/\n\s*\n/).map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 30)}`}>
                <span className="tui-line-no" aria-hidden="true">
                  {String(index + 1).padStart(2, " ")}
                </span>
                <span>{paragraph}</span>
              </p>
            ))}
          </div>
        </TuiBox>
      </section>

      <section className="tui-shell tui-section" id="projects">
        <header className="tui-section-head">
          <p className="tui-comment">{"// projects"}</p>
          <h2>
            <span className="tui-hash">##</span> Recent builds
          </h2>
        </header>

        {projects === undefined ? (
          <p className="tui-muted">
            loading projects
            <span className="tui-ellipsis" />
          </p>
        ) : projects.length === 0 ? (
          <p className="tui-muted">ls: no projects added yet.</p>
        ) : (
          <div className="tui-project-grid">
            {projects.map((project, index) => {
              const slug = slugifyProjectTitle(project.title);
              return (
                <TuiBox
                  as="article"
                  key={project._id}
                  className="tui-project"
                  title={`[${String(index + 1).padStart(2, "0")}] ${slug}`}
                  meta={`${project.imageUrls.length} img`}
                >
                  <div className="tui-project-media">
                    <ProjectCarousel
                      imageUrls={project.imageUrls}
                      alt={project.title}
                      className="h-full"
                    />
                  </div>
                  <div className="tui-project-body">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tui-links">
                      <Link href={`/projects/${slug}`}>[details]</Link>
                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          [visit ↗]
                        </a>
                      ) : null}
                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          [source ↗]
                        </a>
                      ) : null}
                    </div>
                  </div>
                </TuiBox>
              );
            })}
          </div>
        )}
      </section>

      <section className="tui-shell tui-section" id="skills">
        <header className="tui-section-head">
          <p className="tui-comment">{"// skills"}</p>
          <h2>
            <span className="tui-hash">##</span> My favourite/preferred tools
          </h2>
        </header>

        {skills === undefined ? (
          <p className="tui-muted">
            loading skills
            <span className="tui-ellipsis" />
          </p>
        ) : skills.length === 0 ? (
          <p className="tui-muted">ls: no skills added yet.</p>
        ) : (
          <div className="tui-skill-layout">
            <TuiBox
              title="htop — skills"
              meta={`${sortedSkills.length} tasks`}
              bodyClassName="tui-skill-body"
            >
              <div className="tui-skill-head" aria-hidden="true">
                <span>PID</span>
                <span>NAME</span>
                <span>LEVEL</span>
                <span>LVL</span>
              </div>
              <div className="tui-skill-list">
                {sortedSkills.map((skill, index) => (
                  <div className="tui-skill-row" key={skill._id}>
                    <span className="tui-skill-pid">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{skill.name}</strong>
                    <TuiBar value={skill.level} />
                    <em>{skill.level}/10</em>
                  </div>
                ))}
              </div>
            </TuiBox>

            <TuiBox
              title="tree ./categories"
              meta={`${categories.length} dirs`}
            >
              <ul className="tui-tree">
                <li className="tui-tree-root">.</li>
                {categories.map(([category, items], index) => (
                  <li key={category}>
                    <span className="tui-tree-branch" aria-hidden="true">
                      {index === categories.length - 1 ? "└── " : "├── "}
                    </span>
                    <span className="tui-tree-name">{category}/</span>
                    <span className="tui-tree-leader" aria-hidden="true" />
                    <span className="tui-tree-count">{items.length}</span>
                  </li>
                ))}
              </ul>
            </TuiBox>
          </div>
        )}
      </section>

      <section className="tui-shell tui-section" id="contact">
        <header className="tui-section-head">
          <p className="tui-comment">
            {"// "}
            {content.contactEyebrow}
          </p>
          <h2>
            <span className="tui-hash">##</span> {content.contactHeading}
          </h2>
        </header>
        <TuiBox title="contact.sh" meta="exec">
          <div className="tui-prose">
            <p>{content.contactBody}</p>
            <p className="tui-comment">
              # Based in {content.location} · Full-stack, mobile & game
              development
            </p>
          </div>
          <Prompt>
            mail{" "}
            <a className="tui-link" href={`mailto:${content.contactEmail}`}>
              {content.contactEmail}
            </a>
          </Prompt>
          <div className="tui-actions">
            <a
              className="tui-button tui-button-primary"
              href={`mailto:${content.contactEmail}?subject=${encodeURIComponent("Software engineering opportunity")}`}
            >
              email me →
            </a>
            {cv?.url ? (
              <a className="tui-button" href={cvHref} download={cv.fileName}>
                download cv
              </a>
            ) : null}
            <a
              className="tui-button"
              href={content.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              github ↗
            </a>
          </div>
        </TuiBox>
      </section>

      <footer className="tui-shell tui-footer">
        <p>
          -- © {new Date().getFullYear()} NucleusBeast · Building useful things.
          --
        </p>
        <p className="tui-comment">
          # Anonymous session analytics help improve this portfolio. No names or
          IP addresses are stored. Do Not Track is respected.
        </p>
      </footer>
    </main>
  );
}
