"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";

export function ArtworkBackButton() {
  const { t } = useLocale();
  const router = useRouter();
  const [returnUrl, setReturnUrl] = useState("/dziela");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem("artwork_scroll_restoration");
        if (raw) {
          const data = JSON.parse(raw);
          if (data && data.url) setReturnUrl(data.url);
        }
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(returnUrl, { scroll: false });
    }
  };

  return (
    <a
      href={returnUrl}
      onClick={handleClick}
      className="back-arrow"
      aria-label={t("backCatalog")}
      title={t("backCatalog")}
    >
      <ArrowLeft size={16} strokeWidth={1.6} className="back-arrow-icon" />
    </a>
  );
}
