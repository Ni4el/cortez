import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArtworkCard } from "@/components/artwork-card";
import { getPublicArtworks } from "@/lib/catalog.server";
import { sortArtworksBySizeDescending } from "@/lib/catalog";
import { PageNavigator } from "@/components/page-navigator";
import { LandingLink } from "@/components/landing-link";
import { getRequestPreferences } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const artworks = await getPublicArtworks();
  const { messages: m } = await getRequestPreferences();
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
            {m.heroTitle}
          </h1>
          <p className="lede">{m.heroLead}</p>
          <div className="button-row">
            <Link className="button" href="#galeria">{m.visitGallery}</Link>
            <Link className="button button-secondary" href="#dziela">{m.seeWorks}</Link>
          </div>
        </div>
      </section>

      <section className="landing-section landing-panel" id="galeria">
        <div><p className="eyebrow">{m.discoverSpace}</p><h2>{m.gallery}</h2><p>{m.galleryLead}</p></div>
        <LandingLink className="button" href="/galeria">{m.chooseRoom} <span aria-hidden="true">→</span></LandingLink>
      </section>

      <section className="landing-section" id="dziela">
        <div className="landing-section-heading"><div><p className="eyebrow">{m.collection}</p><h2>{m.works}</h2></div></div>
        {featuredArtworks.length ? (
          <div className="artwork-grid">
            {featuredArtworks.slice(0, 3).map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}
            <div className="artwork-card discover-cell">
              <Link className="button" href="/dziela">{m.discover}<span aria-hidden="true"> →</span></Link>
            </div>
          </div>
        ) : <p className="lede">{m.catalogPreparing}</p>}
      </section>

      <section className="landing-section landing-panel" id="wystawy">
        <div><p className="eyebrow">{m.artMeetings}</p><h2>{m.exhibitions}</h2><p>{m.exhibitionsLead}</p></div>
        <LandingLink className="button" href="/wystawy">{m.exploreExhibitions} <span aria-hidden="true">→</span></LandingLink>
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
          <p className="eyebrow">{m.artist}</p>
          <h2>{m.about}</h2>
          <p>{m.aboutLead}</p>
          <div className="landing-about-actions">
            <LandingLink className="button" href="/o-artyscie">{m.moreAbout} <span aria-hidden="true">→</span></LandingLink>
          </div>
        </div>
      </section>

      <section className="landing-section landing-panel" id="certyfikacja">
        <div><p className="eyebrow">{m.authenticity}</p><h2>{m.certification}</h2><p>{m.certificationLead}</p></div>
        <LandingLink className="button" href="/certyfikacja">{m.certificationInfo} <span aria-hidden="true">→</span></LandingLink>
      </section>

      <section className="landing-section landing-order" id="zamow">
        <p className="eyebrow">{m.individualProjects}</p><h2>{m.order}</h2><p>{m.orderLead}</p><LandingLink className="button" href="/zamow">{m.orderInfo}</LandingLink>
      </section>

      <section className="landing-section landing-contact" id="kontakt">
        <div><p className="eyebrow">{m.contact}</p><h2>{m.contactHeading}</h2><p>{m.contactLead}</p></div><LandingLink className="button button-secondary" href="/kontakt">{m.goToContact}</LandingLink>
      </section>
    </div>
  );
}
