"use client";

import { useEffect, useState } from "react";

export const tuiSections = [
  { key: "1", label: "home", href: "/", id: null },
  { key: "2", label: "about", href: "#about", id: "about" },
  { key: "3", label: "projects", href: "#projects", id: "projects" },
  { key: "4", label: "skills", href: "#skills", id: "skills" },
  { key: "5", label: "contact", href: "#contact", id: "contact" },
] as const;

/** Returns the href of the section that is in view on the home page. */
export function useActiveSection(isHomePage: boolean) {
  const [active, setActive] = useState<string>(isHomePage ? "/" : "");

  useEffect(() => {
    if (!isHomePage) {
      setActive("");
      return;
    }

    const update = () => {
      const position = window.scrollY + 140;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      let next = "/";

      for (const section of tuiSections) {
        if (!section.id) continue;
        const element = document.getElementById(section.id);
        if (element && position >= element.offsetTop) {
          next = section.href;
        }
      }

      if (atBottom && document.getElementById("contact")) {
        next = "#contact";
      }

      setActive(next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("hashchange", update);
    };
  }, [isHomePage]);

  return active;
}
