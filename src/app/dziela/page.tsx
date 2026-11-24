import { ArtworksCatalog } from "@/components/artworks-catalog";
import { EmptyState } from "@/components/empty-state";
import { sortArtworksBySizeDescending } from "@/lib/catalog";
import { getPublicArtworks } from "@/lib/catalog.server";

export const metadata = { title: "Dzieła", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function ArtworksPage() {
  const artworks = await getPublicArtworks();
  const sortedArtworks = sortArtworksBySizeDescending(artworks);
  if (sortedArtworks.length === 0) {
    return (
      <EmptyState eyebrow="Katalog" title="Katalog jest przygotowywany">
        <p>Opublikowane dzieła pojawią się tutaj po zatwierdzeniu ich danych i mediów.</p>
      </EmptyState>
    );
  }

  return (
    <section className="content-section" aria-labelledby="artworks-title">
      <ArtworksCatalog initialArtworks={sortedArtworks} />
    </section>
  );
}
