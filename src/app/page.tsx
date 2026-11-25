import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArtworkCard } from "@/components/artwork-card";
import { getPublicArtworks } from "@/lib/catalog.server";
import { sortArtworksBySizeDescending } from "@/lib/catalog";
import { PageNavigator } from "@/components/page-navigator";
import { LandingLink } from "@/components/landing-link";

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
          <h1 id="home-title">
            Przestrzeń<br />dla sztuki
          </h1>
          <p className="lede">Poznaj obrazy, wystawy i historię twórczości.</p>
          <div className="button-row">
            <Link className="button" href="#galeria">Odwiedź galerię</Link>
            <Link className="button button-secondary" href="#dziela">Zobacz dzieła</Link>
          </div>
        </div>
      </section>

      <section className="landing-section landing-panel" id="galeria">
        <div><p className="eyebrow">Odkryj przestrzeń</p><h2>Galeria</h2><p>Wejdź do wirtualnej galerii i stań oko w oko z prawdziwą sztuką.</p></div>
        <LandingLink className="button" href="/galeria">Wybierz salę <span aria-hidden="true">→</span></LandingLink>
      </section>

      <section className="landing-section" id="dziela">
        <div className="landing-section-heading"><div><p className="eyebrow">Kolekcja</p><h2>Dzieła</h2></div></div>
        {featuredArtworks.length ? (
          <div className="artwork-grid">
            {featuredArtworks.slice(0, 3).map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}
            <div className="artwork-card discover-cell">
              <Link className="button" href="/dziela">Odkryj<span aria-hidden="true"> →</span></Link>
            </div>
          </div>
        ) : <p className="lede">Katalog jest przygotowywany.</p>}
      </section>

      <section className="landing-section landing-panel" id="wystawy">
        <div><p className="eyebrow">Spotkania ze sztuką</p><h2>Wystawy</h2><p>Informacje o wystawach i wydarzeniach artystycznych.</p></div>
        <LandingLink className="button" href="/wystawy">Poznaj wystawy <span aria-hidden="true">→</span></LandingLink>
      </section>

      <section className="landing-section landing-about" id="o-autorze">
        <div className="landing-about-image">
          <Image
            src="/media/zbigniew_cortez_zajac.webp"
            alt="Zbigniew Cortez Zając"
            width={1200}
            height={800}
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>
        <div className="landing-about-content">
          <p className="eyebrow">Twórca</p>
          <h2>O autorze</h2>
          <p>Biografia, inspiracje i droga artystyczna Corteza.</p>
          <div className="landing-about-actions">
            <LandingLink className="button" href="/o-artyscie">Więcej o autorze <span aria-hidden="true">→</span></LandingLink>
          </div>
        </div>
      </section>

      <section className="landing-section landing-panel" id="certyfikacja">
        <div><p className="eyebrow">Autentyczność dzieła</p><h2>Certyfikacja</h2><p>Informacje o certyfikatach autentyczności i dokumentacji prac.</p></div>
        <LandingLink className="button" href="/certyfikacja">Informacje o certyfikacji <span aria-hidden="true">→</span></LandingLink>
      </section>

      <section className="landing-section landing-order" id="zamow">
        <p className="eyebrow">Indywidualne projekty</p><h2>Zamów</h2><p>Dowiedz się o możliwości zamówienia pracy.</p><LandingLink className="button" href="/zamow">Informacje o zamówieniach</LandingLink>
      </section>

      <section className="landing-section landing-contact" id="kontakt">
        <div><p className="eyebrow">Kontakt</p><h2>Porozmawiajmy o sztuce</h2><p>Dane kontaktowe zostaną dodane po zatwierdzeniu.</p></div><LandingLink className="button button-secondary" href="/kontakt">Przejdź do kontaktu</LandingLink>
      </section>
    </div>
  );
}
