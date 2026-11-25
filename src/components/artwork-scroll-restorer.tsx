"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ArtworkScrollRestorer() {
  const pathname = usePathname();
  const isRestoring = useRef(false);

  useEffect(() => {
    if (pathname !== "/dziela" && !/^\/dziela\/[^/]+\/?$/.test(pathname)) {
      try { sessionStorage.removeItem("artwork_catalog_filters"); } catch {}
      if ("scrollRestoration" in window.history) window.history.scrollRestoration = "auto";
    }
    if (pathname !== "/") {
      return;
    }

    try {
      const raw = sessionStorage.getItem("artwork_scroll_restoration");
      if (!raw) return;

      const data = JSON.parse(raw);
      if (!data || !data.url) return;

      const storedPath = data.url.split("?")[0].split("#")[0];
      if (storedPath !== pathname) return;

      if (Date.now() - (data.timestamp || 0) > 30 * 60 * 1000) {
        sessionStorage.removeItem("artwork_scroll_restoration");
        return;
      }

      isRestoring.current = true;
      const targetY = typeof data.scrollY === "number" ? data.scrollY : 0;
      const artworkId = data.artworkId as string | undefined;

      if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      const doRestore = () => {
        if (!isRestoring.current) return;

        const element = artworkId ? document.getElementById(artworkId) : null;
        if (element) {
          const rect = element.getBoundingClientRect();
          const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (!inView) {
            window.scrollTo({ top: targetY, behavior: "instant" });
            const afterRect = element.getBoundingClientRect();
            if (afterRect.top < -50 || afterRect.bottom > window.innerHeight + 50) {
              element.scrollIntoView({ block: "center", behavior: "instant" });
            }
          }
        } else {
          window.scrollTo({ top: targetY, behavior: "instant" });
        }
      };

      doRestore();
      const rAF = requestAnimationFrame(doRestore);
      const timer1 = setTimeout(doRestore, 40);
      const timer2 = setTimeout(doRestore, 120);
      const timerClean = setTimeout(() => {
        doRestore();
        isRestoring.current = false;
        if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
          window.history.scrollRestoration = "auto";
        }
        try {
          sessionStorage.removeItem("artwork_scroll_restoration");
        } catch {}
      }, 250);

      return () => {
        cancelAnimationFrame(rAF);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timerClean);
        isRestoring.current = false;
      };
    } catch {
      // ignore
    }
  }, [pathname]);

  return null;
}
