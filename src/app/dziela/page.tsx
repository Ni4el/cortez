import { ArtworksCatalog } from "@/components/artworks-catalog";
import { EmptyState } from "@/components/empty-state";
import { sortArtworksBySizeDescending } from "@/lib/catalog";
import { getPublicArtworks } from "@/lib/catalog.server";
import { LandingBackButton } from "@/components/landing-back-button";
import { getLocalizedMetadata, getRequestPreferences } from "@/lib/i18n.server";

export const generateMetadata = () => getLocalizedMetadata("works");

export const dynamic = "force-dynamic";

export default async function ArtworksPage() {
  const artworks = await getPublicArtworks();
  const { messages: m } = await getRequestPreferences();
  const sortedArtworks = sortArtworksBySizeDescending(artworks);
  if (sortedArtworks.length === 0) {
    return (
      <EmptyState eyebrow={m.catalog} title={m.catalogEmptyTitle} backButton={<LandingBackButton defaultHash="#dziela" />}>
        <p>{m.catalogEmpty}</p>
      </EmptyState>
    );
  }

  return (
    <section className="content-section" aria-labelledby="artworks-title">
      <div className="about-header">
        <LandingBackButton defaultHash="#dziela" />
        <p className="eyebrow">{m.catalog}</p>
      </div>
      <ArtworksCatalog initialArtworks={sortedArtworks} />
    </section>
  );
}
