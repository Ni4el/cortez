export type SaleMode = "direct" | "inquiry" | "none";

export type Artwork = {
  id: string;
  slug: string;
  title?: string;
  description?: string;
  year?: string;
  method?: "Olej na płycie" | "Olej na płótnie" | "Ołówek na papierze";
  size?: string;
  place?: string;
  frame?: string;
  author?: string;
  availability: "available" | "reserved" | "sold" | "gifted" | "not_for_sale";
  isPublished: boolean;
  isMain: boolean;
  saleMode: SaleMode;
  pricePln?: number;
  images: MediaAsset[];
  thumbnail?: MediaAsset;
  wallView?: MediaAsset;
  highResolutionView?: MediaAsset;
};

export type MediaAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Exhibition = {
  id: string;
  slug: string;
  title: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  image?: MediaAsset;
};

export type RoomHotspot = {
  id: string;
  type: "artwork" | "room";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  artworkId?: string;
  targetRoomId?: string;
};

export type Room = {
  id: string;
  slug: string;
  label?: string;
  image: MediaAsset;
  isPublished: boolean;
  isListed?: boolean;
  hotspots: RoomHotspot[];
};

/**
 * Source images supplied with the project are registered here only as
 * unpublished room drafts. Publishing requires an approved label, hotspot
 * map, and valid published targets.
 */
export const rooms: Room[] = [
  {
    id: "room-1",
    slug: "pomieszczenie-1",
    label: "Pomieszczenie 1",
    image: {
      src: "/media/spaces/pomieszczenie_1.jpg",
      alt: "",
      width: 1920,
      height: 1080,
    },
    isPublished: false,
    isListed: true,
    hotspots: [],
  },
  {
    id: "room-2",
    slug: "pomieszczenie-2",
    label: "Pomieszczenie 2",
    image: {
      src: "/media/spaces/pomieszczenie_2.jpg",
      alt: "",
      width: 2752,
      height: 1536,
    },
    isPublished: false,
    isListed: true,
    hotspots: [],
  },
  {
    id: "room-3",
    slug: "pomieszczenie-3",
    label: "Pomieszczenie 3",
    image: {
      src: "/media/spaces/pomieszczenie_3.jpg",
      alt: "",
      width: 2560,
      height: 1429,
    },
    isPublished: false,
    isListed: true,
    hotspots: [],
  },
  {
    id: "room-4",
    slug: "pomieszczenie-4",
    label: "Pomieszczenie 4 — mock",
    image: {
      src: "/media/spaces/pomieszczenie_4.jpg",
      alt: "Widok demonstracyjny pomieszczenia 4",
      width: 1200,
      height: 632,
    },
    isPublished: true,
    isListed: true,
    hotspots: [
      {
        id: "room-4-to-wall-4",
        type: "room",
        x: 80,
        y: 44,
        width: 7,
        height: 17,
        label: "Przejdź do widoku ściany 4",
        targetRoomId: "wall-4",
      },
    ],
  },
  {
    id: "wall-4",
    slug: "wall-4",
    label: "Wall 4 — mock",
    image: {
      src: "/media/wall/pomieszczenie_4_obraz.jpg",
      alt: "Widok demonstracyjny ściany 4 z jednym obrazem",
      width: 1536,
      height: 1024,
    },
    isPublished: true,
    isListed: false,
    hotspots: [
      {
        id: "wall-4-to-artwork-1",
        type: "artwork",
        x: 50,
        y: 44,
        width: 35,
        height: 40,
        label: "Otwórz mock — obraz 1",
        artworkId: "mock-artwork-1",
      },
    ],
  },
];

export function getPublicRooms() {
  return rooms.filter((room) => room.isPublished && room.isListed !== false);
}

export function getRoomSelectorRooms() {
  return rooms.filter((room) => room.isListed !== false);
}

export function getPublicRoom(slug: string) {
  return rooms.find((room) => room.isPublished && room.slug === slug);
}

export function getPublicRoomById(id: string) {
  return rooms.find((room) => room.isPublished && room.id === id);
}

export function isPublicArtwork(artwork: Artwork) {
  return artwork.isPublished;
}

export function canOfferDirectSale(artwork: Artwork) {
  return (
    isPublicArtwork(artwork) &&
    artwork.availability === "available" &&
    artwork.saleMode === "direct" &&
    typeof artwork.pricePln === "number"
  );
}

export const availabilityLabels: Record<Artwork["availability"], string> = {
  available: "Dostępne",
  reserved: "Zarezerwowane",
  sold: "Sprzedane",
  gifted: "Podarowane",
  not_for_sale: "Nie na sprzedaż",
};

export function parseArtworkDimensions(size?: string): { width: number; height: number; area: number } {
  if (!size) return { width: 0, height: 0, area: 0 };
  const match = size.match(/(\d+(?:[.,]\d+)?)\s*[×xX*]\s*(\d+(?:[.,]\d+)?)/);
  if (!match) return { width: 0, height: 0, area: 0 };
  const width = parseFloat(match[1].replace(",", "."));
  const height = parseFloat(match[2].replace(",", "."));
  if (isNaN(width) || isNaN(height)) return { width: 0, height: 0, area: 0 };
  return { width, height, area: width * height };
}

export function sortArtworksBySizeDescending(artworks: Artwork[]): Artwork[] {
  return [...artworks].sort((a, b) => {
    const areaA = parseArtworkDimensions(a.size).area;
    const areaB = parseArtworkDimensions(b.size).area;
    if (areaB !== areaA) {
      return areaB - areaA;
    }
    const maxDimA = Math.max(parseArtworkDimensions(a.size).width, parseArtworkDimensions(a.size).height);
    const maxDimB = Math.max(parseArtworkDimensions(b.size).width, parseArtworkDimensions(b.size).height);
    if (maxDimB !== maxDimA) {
      return maxDimB - maxDimA;
    }
    return 0;
  });
}


