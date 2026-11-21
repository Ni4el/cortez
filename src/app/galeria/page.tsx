import Link from "next/link";
import Image from "next/image";
import { getRoomSelectorRooms } from "@/lib/catalog";

export const metadata = { title: "Galeria", robots: { index: false, follow: false } };

export default function GalleryPage() {
  const rooms = getRoomSelectorRooms();

  return (
    <section className="content-section" aria-labelledby="gallery-title">
      <p className="eyebrow">Galeria 2D</p>
      <h1 id="gallery-title">Wybierz salę</h1>
      <ul className="room-list room-selector-list">
        {rooms.map((room) => (
          <li className={!room.isPublished ? "room-card room-card-disabled" : "room-card"} key={room.id}>
            <div className="room-card-image">
              <Image src={room.image.src} alt={room.image.alt || `Podgląd ${room.label ?? room.slug}`} width={room.image.width} height={room.image.height} sizes="(max-width: 700px) 100vw, 50vw" />
            </div>
            <div className="room-card-copy">
              <div>
                <h2>{room.label ?? "Sala"}</h2>
                <p>{room.isPublished ? "Aktywna" : "W przygotowaniu"}</p>
              </div>
              {room.isPublished ? <Link className="button" href={`/galeria/${room.slug}`}>Wejdź do sali</Link> : <span className="status status-private">Niedostępna</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
