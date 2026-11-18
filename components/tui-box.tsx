import type React from "react";
import { cn } from "@/lib/utils";

type TuiBoxProps = {
  title?: React.ReactNode;
  meta?: React.ReactNode;
  as?: "div" | "section" | "article" | "aside" | "header";
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "title">;

/** A terminal pane: a box with its title and meta label set into the border. */
export function TuiBox({
  title,
  meta,
  as: Tag = "div",
  className,
  bodyClassName,
  children,
  ...rest
}: TuiBoxProps) {
  return (
    <Tag className={cn("tui-box", className)} {...rest}>
      {title ? <span className="tui-box-title">{title}</span> : null}
      {meta ? <span className="tui-box-meta">{meta}</span> : null}
      <div className={cn("tui-box-body", bodyClassName)}>{children}</div>
    </Tag>
  );
}

/** A text progress bar, for example [██████░░░░]. */
export function TuiBar({
  value,
  max = 10,
  cells = 20,
}: {
  value: number;
  max?: number;
  cells?: number;
}) {
  const filled = Math.round((Math.min(Math.max(value, 0), max) / max) * cells);
  return (
    <span className="tui-bar" aria-hidden="true">
      <span className="tui-bar-bracket">[</span>
      <span className="tui-bar-fill">{"█".repeat(filled)}</span>
      <span className="tui-bar-empty">{"░".repeat(cells - filled)}</span>
      <span className="tui-bar-bracket">]</span>
    </span>
  );
}
