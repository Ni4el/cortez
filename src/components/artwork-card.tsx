"use client";

import Image from "next/image";
import Link from "next/link";
import { type Artwork } from "@/lib/catalog";
import { useLocale } from "@/components/locale-provider";

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const { t } = useLocale();
  if (!artwork.thumbnail || !artwork.title) return null;

  const handleCardClick = () => {
    try {
      sessionStorage.setItem(
        "artwork_scroll_restoration",
        JSON.stringify({
          url: window.location.pathname + window.location.search,
          scrollY: window.scrollY,
          artworkId: `artwork-${artwork.slug}`,
          timestamp: Date.now(),
        })
      );
    } catch {}
  };

  return (
    <article className="artwork-card" id={`artwork-${artwork.slug}`}>
      <Link href={`/dziela/${artwork.slug}`} className="artwork-card-image" onClick={handleCardClick}>
        <Image
          src={artwork.thumbnail.src}
          alt={artwork.thumbnail.alt}
          width={artwork.thumbnail.width}
          height={artwork.thumbnail.height}
          sizes="(max-width: 700px) 100vw, 33vw"
        />
      </Link>
      <div className="artwork-card-copy">
        <div className="artwork-card-info">
          <h2 className="artwork-card-title" title={artwork.title}>
            <Link href={`/dziela/${artwork.slug}`} onClick={handleCardClick}>
              {artwork.title}
            </Link>
          </h2>
          {artwork.year ? <p>{artwork.year}</p> : null}
        </div>
        <span className={`status status-${artwork.availability}`}>{t(artwork.availability)}</span>
      </div>
    </article>
  );
}
