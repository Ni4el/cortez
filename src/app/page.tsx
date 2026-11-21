import Link from "next/link";
import type { CSSProperties } from "react";
import { ArtworkCard } from "@/components/artwork-card";
import { getPublicArtworks } from "@/lib/catalog.server";
import { sortArtworksBySizeDescending } from "@/lib/catalog";
import { PageNavigator } from "@/components/page-navigator";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const artworks = await getPublicArtworks();
  const mainArtwork = artworks.find((artwork) => artwork.isMain && artwork.thumbnail);
  const featuredArtworks = sortArtworksBySizeDescending(artworks).slice(0, 4);

  return (
    <div className="landing-page">
      <PageNavigator />
      <section
        className={`hero landing-section${mainArtwork ? " has-main-artwork" : ""}`}
        id="start"
        aria-labelledby="home-title"
        style={mainArtwork?.thumbnail ? { "--hero-image": `url("${mainArtwork.thumbnail.src}")` } as CSSProperties : undefined}
      >
        <div className="hero-content">
          <p className="eyebrow">Portfolio</p>
          <h1 id="home-title">Przestrzeń dla sztuki</h1>
          <p className="lede">Poznaj obrazy, wystawy i historię twórczości.</p>
          <div className="button-row">
            <Link className="button" href="#galeria">Odwiedź galerię</Link>
            <Link className="button button-secondary" href="#dziela">Zobacz dzieła</Link>
          </div>
        </div>
      </section>

      <section className="landing-section landing-panel" id="galeria">
        <div><p className="eyebrow">Odkryj przestrzeń</p><h2>Galeria</h2><p>Wejdź do wirtualnej galerii i poczuj jakby obrazy wisiały na ścianie tuż przed Twoimi oczami.</p></div>
        <Link className="button" href="/galeria">Wybierz salę <span aria-hidden="true">→</span></Link>
      </section>

      <section className="landing-section" id="dziela">
        <div className="landing-section-heading"><div><p className="eyebrow">Kolekcja</p><h2>Dzieła</h2></div><Link className="text-link" href="/dziela">Zobacz cały katalog →</Link></div>
        {featuredArtworks.length ? <div className="artwork-grid">{featuredArtworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}</div> : <p className="lede">Katalog jest przygotowywany.</p>}
      </section>

      <section className="landing-section landing-panel" id="wystawy">
        <div><p className="eyebrow">Spotkania ze sztuką</p><h2>Wystawy</h2><p>Informacje o wystawach i wydarzeniach artystycznych.</p></div>
        <Link className="button" href="/wystawy">Poznaj wystawy <span aria-hidden="true">→</span></Link>
      </section>

      <section className="landing-section landing-panel landing-about" id="o-autorze">
        <div>
          <p className="eyebrow">Twórca</p>
          <h2>O autorze</h2>
          <p>Biografia, inspiracje i droga artystyczna Zbigniewa "Corteza" Zająca.</p>
        </div>
        <Link className="button" href="/o-artyscie">Więcej o autorze <span aria-hidden="true">→</span></Link>
      </section>

      <section className="landing-section landing-panel" id="certyfikacja">
        <div><p className="eyebrow">Autentyczność dzieła</p><h2>Certyfikacja</h2><p>Informacje o certyfikatach autentyczności i dokumentacji prac.</p></div>
        <Link className="button" href="/certyfikacja">Informacje o certyfikacji <span aria-hidden="true">→</span></Link>
      </section>

      <section className="landing-section landing-order" id="zamow">
        <p className="eyebrow">Indywidualne projekty</p><h2>Zamów</h2><p>Dowiedz się o możliwości zamówienia pracy.</p><Link className="button" href="/zamow">Informacje o zamówieniach</Link>
      </section>

      <section className="landing-section landing-contact" id="kontakt">
        <div><p className="eyebrow">Kontakt</p><h2>Porozmawiajmy o sztuce</h2><p>Dane kontaktowe zostaną dodane po zatwierdzeniu.</p></div><Link className="button button-secondary" href="/kontakt">Przejdź do kontaktu</Link>
      </section>
    </div>
  );
}
