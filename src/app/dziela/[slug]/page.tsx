import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkImageViewer } from "@/components/artwork-image-viewer";
import { availabilityLabels, canOfferDirectSale } from "@/lib/catalog";
import { getPublicArtwork } from "@/lib/catalog.server";

export const dynamic = "force-dynamic";

type ArtworkPageProps = { params: Promise<{ slug: string }> };

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const artwork = await getPublicArtwork((await params).slug);
  if (!artwork || !artwork.title) notFound();

  const directSaleAvailable = canOfferDirectSale(artwork);
  const displayImage = artwork.highResolutionView ?? artwork.thumbnail ?? artwork.wallView;
  const galleryImages = artwork.images.length ? artwork.images : displayImage ? [displayImage] : [];

  return (
    <article className="artwork-page">
      <Link className="back-link" href="/dziela">← Wróć do katalogu</Link>
      <div className="artwork-layout">
        <div className="artwork-view">
          {galleryImages.length ? (
            <ArtworkImageViewer images={galleryImages} />
          ) : <p className="media-unavailable">Widok dzieła zostanie opublikowany po zatwierdzeniu.</p>}
        </div>
        <div className="artwork-details">
          <p className="eyebrow">Dzieło</p>
          <h1>{artwork.title}</h1>
          {artwork.description ? <p>{artwork.description}</p> : null}
          <p className={`status status-${artwork.availability}`}>{availabilityLabels[artwork.availability]}</p>
          <dl>
            {artwork.year ? <><dt>Rok</dt><dd>{artwork.year}</dd></> : null}
            {artwork.method ? <><dt>Technika</dt><dd>{artwork.method}</dd></> : null}
            {artwork.size ? <><dt>Rozmiar</dt><dd>{artwork.size}</dd></> : null}
          </dl>
          {typeof artwork.pricePln === "number" ? <p className="artwork-price">{new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(artwork.pricePln)}</p> : null}
          {directSaleAvailable ? (
            <p className="action-note">Zakup bezpośredni zostanie włączony po skonfigurowaniu płatności i dostawy.</p>
          ) : artwork.saleMode === "inquiry" ? (
            <Link className="button" href={`/kontakt?dzielo=${encodeURIComponent(artwork.slug)}`}>Zapytaj o dzieło</Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
