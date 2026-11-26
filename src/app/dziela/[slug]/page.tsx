import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkImageViewer } from "@/components/artwork-image-viewer";
import { ArtworkBackButton } from "@/components/artwork-back-button";
import { canOfferDirectSale, formatPrice } from "@/lib/catalog";
import { getPublicArtwork } from "@/lib/catalog.server";
import { getRequestPreferences } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

type ArtworkPageProps = { params: Promise<{ slug: string }> };

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const artwork = await getPublicArtwork((await params).slug);
  const { messages: m, currency, currencies } = await getRequestPreferences();
  if (!artwork || !artwork.title) notFound();

  const directSaleAvailable = canOfferDirectSale(artwork);
  const currencyFormat = currencies.find((item) => item.code === currency);
  const displayImage = artwork.highResolutionView ?? artwork.thumbnail ?? artwork.wallView;
  const galleryImages = artwork.images.length ? artwork.images : displayImage ? [displayImage] : [];

  return (
    <article className="artwork-page">
      <div className="about-header">
        <ArtworkBackButton />
        <p className="eyebrow">{m.artwork}</p>
      </div>
      <div className="artwork-layout">
        <div className="artwork-view">
          {galleryImages.length ? (
            <ArtworkImageViewer images={galleryImages} />
          ) : <p className="media-unavailable">{m.mediaUnavailable}</p>}
        </div>
        <div className="artwork-details">
          <h1>{artwork.title}</h1>
          {artwork.description ? <p>{artwork.description}</p> : null}
          <p className={`status status-${artwork.availability}`}>{m[artwork.availability]}</p>
          <dl>
            {artwork.year ? <><dt>{m.year}</dt><dd>{artwork.year}</dd></> : null}
            {artwork.method ? <><dt>{m.technique}</dt><dd>{m[artwork.method] ?? artwork.method}</dd></> : null}
            {artwork.size ? <><dt>{m.dimensions}</dt><dd>{artwork.size}</dd></> : null}
          </dl>
          {typeof artwork.price === "number" && currencyFormat ? <p className="artwork-price">{formatPrice(artwork.price, currency, currencyFormat)}</p> : null}
          {directSaleAvailable ? (
            <p className="action-note">{m.directSaleNote}</p>
          ) : artwork.saleMode === "inquiry" ? (
            <Link className="button" href={`/kontakt?dzielo=${encodeURIComponent(artwork.slug)}`}>{m.inquireArtwork}</Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
