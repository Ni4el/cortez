"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";

export function BackToTop() {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  return <button className="back-to-top" type="button" aria-label={t("backToTop")} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>;
}
