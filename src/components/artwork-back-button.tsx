"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ArtworkBackButton() {
  const router = useRouter();
  const [returnUrl, setReturnUrl] = useState("/dziela");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("artwork_scroll_restoration");
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.url) {
          setReturnUrl(data.url);
        }
      }
    } catch {}
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
    <a href={returnUrl} onClick={handleClick} className="back-link">
      ← Wróć do katalogu
    </a>
  );
}
