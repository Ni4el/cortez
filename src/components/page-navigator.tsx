"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";

const sections = [
  ["start", "start"], ["galeria", "gallery"], ["dziela", "works"], ["wystawy", "exhibitions"],
  ["o-autorze", "about"], ["certyfikacja", "certification"], ["zamow", "order"], ["kontakt", "contact"],
] as const;

export function PageNavigator() {
  const { t } = useLocale();
  const [active, setActive] = useState("start");
  const animationFrame = useRef(0);

  useEffect(() => {
    const elements = sections.map(([id]) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    let frame = 0;
    const animateTo = (index: number) => {
      const boundedIndex = Math.max(0, Math.min(elements.length - 1, index));
      const target = elements[boundedIndex];
      if (!target) return;

      cancelAnimationFrame(animationFrame.current);
      setActive(target.id);

      const startY = window.scrollY;
      const targetY = target.id === "start" ? 0 : Math.max(0, startY + target.getBoundingClientRect().top);
      const distance = targetY - startY;
      const duration = 1250;
      const startTime = performance.now();
      const ease = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        window.scrollTo(0, startY + distance * ease(progress));
        if (progress < 1) animationFrame.current = requestAnimationFrame(step);
        else {
          window.scrollTo(0, targetY);
        }
      };
      animationFrame.current = requestAnimationFrame(step);
    };

    const updateActiveSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const readingLine = window.scrollY + window.innerHeight * 0.45;
        let current = elements[0];
        for (let index = 0; index < elements.length; index += 1) {
          const element = elements[index];
          if (element.offsetTop <= readingLine) {
            current = element;
          } else break;
        }
        if (current) setActive(current.id);
      });
    };

    const onNavigatorClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(".page-navigator a");
      if (!link) return;
      const index = sections.findIndex(([id]) => link.hash === `#${id}`);
      if (index < 0) return;
      event.preventDefault();
      animateTo(index);
      history.replaceState(null, "", `#${sections[index][0]}`);
    };

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    document.addEventListener("click", onNavigatorClick);
    updateActiveSection();
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(animationFrame.current);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      document.removeEventListener("click", onNavigatorClick);
    };
  }, []);

  return (
    <nav className="page-navigator" aria-label={t("sectionNavigation")}>
      {sections.map(([id, label]) => (
        <a key={id} href={`#${id}`} className={active === id ? "is-active" : ""} aria-current={active === id ? "location" : undefined} aria-label={t(label)} />
      ))}
    </nav>
  );
}
