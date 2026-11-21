"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { SideNavigation } from "@/components/side-navigation";

export function SiteHeader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let previousY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY <= 100 || currentY < previousY);
      previousY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${visible ? " is-visible" : " is-hidden"}`}>
      <SideNavigation />
      <Link className="wordmark" href="/" aria-label="Strona główna">
        <Image src="/media/cortez_podpis.png" alt="" width={1254} height={1254} priority />
      </Link>
      <div className="header-tools"><ThemeToggle /><LanguageToggle /></div>
    </header>
  );
}
