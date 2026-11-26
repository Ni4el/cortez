"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";

const links = [
  ["/#start", "start"], ["/#galeria", "gallery"], ["/#dziela", "works"], ["/#wystawy", "exhibitions"],
  ["/#o-autorze", "about"], ["/#certyfikacja", "certification"], ["/#zamow", "order"], ["/#kontakt", "contact"],
] as const;

export function SideNavigation() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <button className="menu-icon" type="button" aria-label={t("openNav")} aria-expanded={open} onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {open ? <div className="side-nav-backdrop" onClick={() => setOpen(false)} /> : null}
      <aside className={`side-nav-panel${open ? " is-open" : ""}`} aria-label={t("mainMenu")} aria-hidden={!open}>
        <div className="side-nav-heading">
          <Link className="side-nav-wordmark" href="/" aria-label={t("home")} onClick={() => setOpen(false)}>
            <Image src="/media/cortez_podpis.png" alt="" width={1254} height={1254} />
          </Link>
          <button type="button" aria-label={t("closeNav")} onClick={() => setOpen(false)}>×</button>
        </div>
        <nav>
          {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{t(label)}</Link>)}
        </nav>
      </aside>
    </>
  );
}
