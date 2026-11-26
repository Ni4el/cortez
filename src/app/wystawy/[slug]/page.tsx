import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicExhibition } from "@/lib/catalog.server";
import { getRequestPreferences } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

function formatDate(locale: string, date?: string) {
  return date ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(`${date}T00:00:00`)) : undefined;
}

export default async function ExhibitionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exhibition = await getPublicExhibition(slug);
  const { messages: m, language } = await getRequestPreferences();
  if (!exhibition) notFound();

  const start = formatDate(language.locale, exhibition.startDate);
  const end = formatDate(language.locale, exhibition.endDate);
  const dates = start && end ? `${start} — ${end}` : start || end;

  return (
    <article className="content-section exhibition-detail" aria-labelledby="exhibition-title">
      <div className="about-header">
        <Link className="back-arrow" href="/wystawy" aria-label={m.allExhibitions}>
          <ArrowLeft size={16} strokeWidth={1.6} className="back-arrow-icon" />
        </Link>
        <p className="eyebrow">{m.exhibition}</p>
      </div>
      <h1 id="exhibition-title">{exhibition.title}</h1>
      {exhibition.venue ? <p className="exhibition-venue">{exhibition.venue}</p> : null}
      {dates ? <p className="exhibition-dates">{dates}</p> : null}
      {exhibition.image ? <Image className="exhibition-detail-image" src={exhibition.image.src} alt={exhibition.image.alt} width={exhibition.image.width} height={exhibition.image.height} priority /> : null}
      {exhibition.description ? <p className="exhibition-description">{exhibition.description}</p> : null}
    </article>
  );
}
