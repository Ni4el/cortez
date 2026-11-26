"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";

type LandingBackButtonProps = {
  /** Fallback anchor on the landing page, e.g. "#galeria" */
  defaultHash?: string;
};

export function LandingBackButton({ defaultHash = "" }: LandingBackButtonProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [returnHref, setReturnHref] = useState("/" + defaultHash);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = sessionStorage.getItem("landing_nav_origin");
        if (raw) {
          const data = JSON.parse(raw);
          if (data && data.href) setReturnHref(data.href);
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
      router.push(returnHref, { scroll: false });
    }
  };

  return (
    <a
      href={returnHref}
      onClick={handleClick}
      className="back-arrow"
      aria-label={t("back")}
      title={t("back")}
    >
      <ArrowLeft size={16} strokeWidth={1.6} className="back-arrow-icon" />
    </a>
  );
}
