import { ArrowLeft, ArrowUpRight, Ruler } from "lucide-react";
import Link from "next/link";

const skeletonThumbs = ["01", "02", "03", "04"];

export function ProjectDetailSkeleton() {
  return (
    <main className="blueprint-page min-h-screen">
      <section
        className="blueprint-shell blueprint-detail blueprint-detail-loading"
        aria-busy="true"
        aria-label="Loading project details"
      >
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
            <div className="blueprint-skeleton blueprint-skeleton-title" />
            <div className="blueprint-skeleton blueprint-skeleton-title blueprint-skeleton-title-short" />
          </div>

          <div className="blueprint-detail-summary">
            <div>
              <div className="blueprint-skeleton blueprint-skeleton-line" />
              <div className="blueprint-skeleton blueprint-skeleton-line" />
              <div className="blueprint-skeleton blueprint-skeleton-line blueprint-skeleton-line-short" />
            </div>
            <div className="blueprint-detail-actions">
              <div className="blueprint-skeleton blueprint-skeleton-action" />
              <div className="blueprint-skeleton blueprint-skeleton-action blueprint-skeleton-action-secondary" />
            </div>
          </div>
        </header>

        <div className="blueprint-detail-layout">
          <section className="blueprint-detail-media">
            <div className="blueprint-detail-media-top">
              <span>Frame --</span>
              <span>Loading captures</span>
            </div>
            <div className="blueprint-detail-frame blueprint-detail-frame-loading">
              <div className="blueprint-skeleton blueprint-skeleton-image" />
            </div>
            <div className="blueprint-detail-thumbs">
              {skeletonThumbs.map((label) => (
                <div className="blueprint-detail-thumb" key={label}>
                  <div className="blueprint-skeleton blueprint-skeleton-thumb" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="blueprint-detail-spec">
            <div className="blueprint-detail-spec-head">
              <span>Build notes</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <dl>
              {["Gallery", "Live URL", "Repository"].map((label) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    <div className="blueprint-skeleton blueprint-skeleton-spec" />
                  </dd>
                </div>
              ))}
            </dl>

            <div className="blueprint-detail-description">
              <span>Description</span>
              <div>
                <div className="blueprint-skeleton blueprint-skeleton-line" />
                <div className="blueprint-skeleton blueprint-skeleton-line blueprint-skeleton-line-short" />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
