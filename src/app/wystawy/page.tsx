import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { getPublicExhibitions } from "@/lib/catalog.server";
import { LandingBackButton } from "@/components/landing-back-button";
import { getLocalizedMetadata, getRequestPreferences } from "@/lib/i18n.server";

export const generateMetadata = () => getLocalizedMetadata("exhibitions");
export const dynamic = "force-dynamic";

function formatDate(locale: string, date?: string) {
  return date ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(`${date}T00:00:00`)) : undefined;
}

export default async function ExhibitionsPage() {
  const exhibitions = await getPublicExhibitions();
  const { messages: m, language } = await getRequestPreferences();

  if (!exhibitions.length) {
    return <EmptyState eyebrow={m.exhibitions} title={m.exhibitionsEmptyTitle} backButton={<LandingBackButton defaultHash="#wystawy" />}><p>{m.exhibitionsEmpty}</p></EmptyState>;
  }

  return (
    <section className="content-section exhibitions-page" aria-labelledby="exhibitions-title">
      <div className="about-header">
        <LandingBackButton defaultHash="#wystawy" />
        <p className="eyebrow">{m.exhibitions}</p>
      </div>
      <h1 id="exhibitions-title">{m.exhibitionsTitle}</h1>
      <div className="exhibition-list">
        {exhibitions.map((exhibition) => {
          const start = formatDate(language.locale, exhibition.startDate);
          const end = formatDate(language.locale, exhibition.endDate);
          const dates = start && end ? `${start} — ${end}` : start || end;
          return <Link className="exhibition-card" href={`/wystawy/${exhibition.slug}`} key={exhibition.id}>
            {exhibition.image ? <Image className="exhibition-image" src={exhibition.image.src} alt={exhibition.image.alt} width={exhibition.image.width} height={exhibition.image.height} /> : <div className="exhibition-image exhibition-image-placeholder" aria-hidden="true" />}
            <div className="exhibition-copy">
              <h2>{exhibition.title}</h2>
              {exhibition.venue ? <p className="exhibition-venue">{exhibition.venue}</p> : null}
              {dates ? <p className="exhibition-dates">{dates}</p> : null}
              <span className="exhibition-link">{m.details} <span aria-hidden="true">→</span></span>
            </div>
          </Link>;
        })}
      </div>
    </section>
  );
}
