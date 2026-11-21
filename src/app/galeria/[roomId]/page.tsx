import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicRoom, getPublicRoomById } from "@/lib/catalog";
import { getPublicArtworks } from "@/lib/catalog.server";

type RoomPageProps = { params: Promise<{ roomId: string }> };

export default async function RoomPage({ params }: RoomPageProps) {
  const room = getPublicRoom((await params).roomId);
  if (!room) notFound();
  const artworks = await getPublicArtworks();

  return (
    <section className="room-page" aria-labelledby="room-title">
      <div className="room-toolbar">
        <Link className="back-link" href="/galeria">← Wszystkie sale</Link>
        <h1 id="room-title">{room.label ?? "Galeria"}</h1>
      </div>
      <div className="room-image-wrap">
        <Image
          className="room-image"
          src={room.image.src}
          alt={room.image.alt}
          width={room.image.width}
          height={room.image.height}
          priority
        />
        {room.hotspots.map((hotspot) => {
          const style = {
            left: `${hotspot.x}%`, top: `${hotspot.y}%`, width: `${hotspot.width}%`, height: `${hotspot.height}%`,
          };
          if (hotspot.type === "artwork" && hotspot.artworkId) {
            const artwork = artworks.find((candidate) => candidate.id === hotspot.artworkId);
            if (!artwork) return null;
            return <Link key={hotspot.id} className="hotspot" style={style} href={`/dziela/${artwork.slug}`} aria-label={hotspot.label} />;
          }
          if (hotspot.type === "room" && hotspot.targetRoomId) {
            const destination = getPublicRoomById(hotspot.targetRoomId);
            if (!destination) return null;
            return <Link key={hotspot.id} className="hotspot" style={style} href={`/galeria/${destination.slug}`} aria-label={hotspot.label} />;
          }
          return null;
        })}
      </div>
      <section className="room-artworks" aria-labelledby="room-works-title">
        <h2 id="room-works-title">Dzieła w tej sali</h2>
        <p>Lista będzie dostępna wraz z opublikowanymi przypisaniami dzieł.</p>
      </section>
    </section>
  );
}
