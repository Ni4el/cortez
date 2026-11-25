import { ArtworksCatalog } from "@/components/artworks-catalog";
import { EmptyState } from "@/components/empty-state";
import { sortArtworksBySizeDescending } from "@/lib/catalog";
import { getPublicArtworks } from "@/lib/catalog.server";
import { LandingBackButton } from "@/components/landing-back-button";

export const metadata = { title: "Dzieła", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function ArtworksPage() {
  const artworks = await getPublicArtworks();
  const sortedArtworks = sortArtworksBySizeDescending(artworks);
  if (sortedArtworks.length === 0) {
    return (
      <EmptyState eyebrow="Katalog" title="Katalog jest przygotowywany" backButton={<LandingBackButton defaultHash="#dziela" />}>
        <p>Opublikowane dzieła pojawią się tutaj po zatwierdzeniu ich danych i mediów.</p>
      </EmptyState>
    );
  }

  return (
    <section className="content-section" aria-labelledby="artworks-title">
      <div className="about-header">
        <LandingBackButton defaultHash="#dziela" />
        <p className="eyebrow">Katalog</p>
      </div>
      <ArtworksCatalog initialArtworks={sortedArtworks} />
    </section>
  );
}
