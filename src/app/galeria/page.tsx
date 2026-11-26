import Link from "next/link";
import Image from "next/image";
import { getRoomSelectorRooms } from "@/lib/catalog";
import { LandingBackButton } from "@/components/landing-back-button";
import { getLocalizedMetadata, getRequestPreferences } from "@/lib/i18n.server";

export const generateMetadata = () => getLocalizedMetadata("gallery");

export default async function GalleryPage() {
  const rooms = getRoomSelectorRooms();
  const { messages: m } = await getRequestPreferences();

  return (
    <section className="content-section" aria-labelledby="gallery-title">
      <div className="about-header">
        <LandingBackButton defaultHash="#galeria" />
        <p className="eyebrow">{m.gallery2d}</p>
      </div>
      <h1 id="gallery-title">{m.chooseRoom}</h1>
      <ul className="room-list room-selector-list">
        {rooms.map((room) => (
          <li className={!room.isPublished ? "room-card room-card-disabled" : "room-card"} key={room.id}>
            <div className="room-card-image">
              <Image src={room.image.src} alt={`${m.roomPreview} ${m[room.slug] ?? room.label ?? room.slug}`} width={room.image.width} height={room.image.height} sizes="(max-width: 700px) 100vw, 50vw" />
            </div>
            <div className="room-card-copy">
              <div>
                <h2>{m[room.slug] ?? room.label ?? m.room}</h2>
                <p>{room.isPublished ? m.roomActive : m.roomPreparing}</p>
              </div>
              {room.isPublished ? <Link className="button" href={`/galeria/${room.slug}`}>{m.enterRoom}</Link> : <span className="status status-private">{m.unavailable}</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
