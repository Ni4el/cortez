"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type LandingBackButtonProps = {
  /** Fallback anchor on the landing page, e.g. "#galeria" */
  defaultHash?: string;
};

export function LandingBackButton({ defaultHash = "" }: LandingBackButtonProps) {
  const router = useRouter();
  const [returnHref, setReturnHref] = useState("/" + defaultHash);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("landing_nav_origin");
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.href) {
          setReturnHref(data.href);
        }
      }
    } catch {}
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
      aria-label="Powrót"
      title="Powrót"
    >
      <ArrowLeft size={16} strokeWidth={1.6} className="back-arrow-icon" />
    </a>
  );
}
