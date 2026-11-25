"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/** A wrapper around Next.js Link that records the current landing page section
 *  in sessionStorage before navigating away. Use it for all outbound links on
 *  the landing page so subpages can return to the correct section. */
export function LandingLink({
  href,
  children,
  ...props
}: ComponentProps<typeof Link>) {
  const handleClick = () => {
    try {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      sessionStorage.setItem(
        "landing_nav_origin",
        JSON.stringify({
          href: "/" + hash, // e.g. "/#galeria"
          scrollY: typeof window !== "undefined" ? window.scrollY : 0,
          timestamp: Date.now(),
        })
      );
    } catch {}
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
