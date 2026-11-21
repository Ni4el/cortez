import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicExhibition } from "@/lib/catalog.server";

export const dynamic = "force-dynamic";

function formatDate(date?: string) {
  return date ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(new Date(`${date}T00:00:00`)) : undefined;
}

export default async function ExhibitionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exhibition = await getPublicExhibition(slug);
  if (!exhibition) notFound();

  const start = formatDate(exhibition.startDate);
  const end = formatDate(exhibition.endDate);
  const dates = start && end ? `${start} — ${end}` : start || end;

  return (
    <article className="content-section exhibition-detail" aria-labelledby="exhibition-title">
      <Link className="back-link" href="/wystawy">← Wszystkie wystawy</Link>
      <p className="eyebrow">Wystawa</p>
      <h1 id="exhibition-title">{exhibition.title}</h1>
      {exhibition.venue ? <p className="exhibition-venue">{exhibition.venue}</p> : null}
      {dates ? <p className="exhibition-dates">{dates}</p> : null}
      {exhibition.image ? <Image className="exhibition-detail-image" src={exhibition.image.src} alt={exhibition.image.alt} width={exhibition.image.width} height={exhibition.image.height} priority /> : null}
      {exhibition.description ? <p className="exhibition-description">{exhibition.description}</p> : null}
    </article>
  );
}
