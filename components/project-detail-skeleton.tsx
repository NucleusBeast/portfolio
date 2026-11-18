import Link from "next/link";
import { TuiBox } from "@/components/tui-box";

const skeletonThumbs = ["01", "02", "03", "04"];

export function ProjectDetailSkeleton() {
  return (
    <main className="tui-page">
      <section
        className="tui-shell tui-detail"
        aria-busy="true"
        aria-label="Loading project details"
      >
        <Link href="/#projects" className="tui-button">
          ← cd ..
        </Link>

        <header className="tui-detail-hero">
          <p className="tui-comment">
            {"// loading project sheet"}
            <span className="tui-ellipsis" />
          </p>
          <div className="tui-skeleton tui-skeleton-title" />
          <div className="tui-skeleton tui-skeleton-line" />
          <div className="tui-skeleton tui-skeleton-line tui-skeleton-short" />
        </header>

        <div className="tui-detail-layout">
          <TuiBox
            as="section"
            title="frame --"
            meta="loading"
            bodyClassName="tui-detail-media"
          >
            <div className="tui-detail-frame">
              <div className="tui-skeleton tui-skeleton-fill" />
            </div>
            <div className="tui-detail-thumbs">
              {skeletonThumbs.map((label) => (
                <div className="tui-detail-thumb" key={label}>
                  <div className="tui-skeleton tui-skeleton-fill" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </TuiBox>

          <TuiBox as="aside" title="build-notes" meta="spec">
            <dl className="tui-spec">
              {["gallery", "live_url", "repository"].map((label) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    <div className="tui-skeleton tui-skeleton-spec" />
                  </dd>
                </div>
              ))}
            </dl>
          </TuiBox>
        </div>
      </section>
    </main>
  );
}
