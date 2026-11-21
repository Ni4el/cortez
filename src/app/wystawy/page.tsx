import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { getPublicExhibitions } from "@/lib/catalog.server";

export const metadata = { title: "Wystawy", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function formatDate(date?: string) {
  return date ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(new Date(`${date}T00:00:00`)) : undefined;
}

export default async function ExhibitionsPage() {
  const exhibitions = await getPublicExhibitions();

  if (!exhibitions.length) {
    return <EmptyState eyebrow="Wystawy" title="Informacje o wystawach"><p>Aktualnie nie ma opublikowanych wystaw.</p></EmptyState>;
  }

  return (
    <section className="content-section exhibitions-page" aria-labelledby="exhibitions-title">
      <p className="eyebrow">Wystawy</p>
      <h1 id="exhibitions-title">Wystawy i wydarzenia</h1>
      <div className="exhibition-list">
        {exhibitions.map((exhibition) => {
          const start = formatDate(exhibition.startDate);
          const end = formatDate(exhibition.endDate);
          const dates = start && end ? `${start} — ${end}` : start || end;
          return <Link className="exhibition-card" href={`/wystawy/${exhibition.slug}`} key={exhibition.id}>
            {exhibition.image ? <Image className="exhibition-image" src={exhibition.image.src} alt={exhibition.image.alt} width={exhibition.image.width} height={exhibition.image.height} /> : <div className="exhibition-image exhibition-image-placeholder" aria-hidden="true" />}
            <div className="exhibition-copy">
              <h2>{exhibition.title}</h2>
              {exhibition.venue ? <p className="exhibition-venue">{exhibition.venue}</p> : null}
              {dates ? <p className="exhibition-dates">{dates}</p> : null}
              <span className="exhibition-link">Zobacz szczegóły <span aria-hidden="true">→</span></span>
            </div>
          </Link>;
        })}
      </div>
    </section>
  );
}
