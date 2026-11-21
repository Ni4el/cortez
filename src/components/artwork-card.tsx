import Image from "next/image";
import Link from "next/link";
import { type Artwork, availabilityLabels } from "@/lib/catalog";

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  if (!artwork.thumbnail || !artwork.title) return null;

  return (
    <article className="artwork-card">
      <Link href={`/dziela/${artwork.slug}`} className="artwork-card-image">
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
          <h2 className="artwork-card-title" title={artwork.title}><Link href={`/dziela/${artwork.slug}`}>{artwork.title}</Link></h2>
          {artwork.year ? <p>{artwork.year}</p> : null}
        </div>
        <span className={`status status-${artwork.availability}`}>{availabilityLabels[artwork.availability]}</span>
      </div>
    </article>
  );
}
