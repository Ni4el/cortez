import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Artwork, Exhibition, MediaAsset } from "@/lib/catalog";

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Brak konfiguracji Supabase. Ustaw NEXT_PUBLIC_SUPABASE_URL i klucz Publishable w .env.local.");
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

function throwIfError(error: { message: string } | null, action: string): void {
  if (error) throw new Error(`Supabase: ${action}: ${error.message}`);
}

export async function getPublicArtworks(): Promise<Artwork[]> {
  const supabase = createPublicSupabaseClient();
  const { data: records, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("publication_status", "published")
    .order("order")
    .order("created_at", { ascending: false });
  throwIfError(error, "nie udało się pobrać dzieł");
  if (!records?.length) return [];

  const artworkIds = records.map((record) => record.id);
  const { data: assets, error: mediaError } = await supabase
    .from("media_assets")
    .select("*")
    .in("artwork_id", artworkIds)
    .eq("is_public", true);
  throwIfError(mediaError, "nie udało się pobrać zdjęć dzieł");

  return records.map((record) => {
    const artworkMedia = (assets ?? [])
      .filter((asset) => asset.artwork_id === record.id)
      .sort((first, second) => Number(first.sort_order ?? 0) - Number(second.sort_order ?? 0) || first.created_at.localeCompare(second.created_at));
    const toImage = (asset: NonNullable<typeof assets>[number] | undefined): MediaAsset | undefined => {
      if (!asset) return undefined;
      const { data } = supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path);
      return {
        src: data.publicUrl,
        alt: asset.alt_text || record.title || "Obraz",
        width: asset.width || 1200,
        height: asset.height || 900,
      };
    };
    const thumbnailAsset = artworkMedia.find((asset) => asset.role === "thumbnail")
      ?? artworkMedia.find((asset) => asset.id === record.image_id);
    const artwork: Artwork = {
      id: record.id,
      slug: record.slug,
      title: record.title ?? undefined,
      description: record.description ?? undefined,
      year: record.year ?? undefined,
      method: record.method ?? undefined,
      size: record.size ?? undefined,
      place: record.place ?? undefined,
      frame: record.frame ?? undefined,
      colors: record.colors ?? undefined,
      author: record.author ?? undefined,
      availability: record.availability,
      isPublished: record.publication_status === "published",
      isMain: record.is_main,
      saleMode: record.sale_mode,
      pricePln: record.price_pln ?? undefined,
      createdAt: record.created_at,
      images: artworkMedia
        .filter((asset) => asset.role === "thumbnail" || asset.role === "high_resolution")
        .map((asset) => toImage(asset))
        .filter((image): image is MediaAsset => Boolean(image)),
      thumbnail: toImage(thumbnailAsset),
      wallView: toImage(artworkMedia.find((asset) => asset.role === "wall_view")),
      highResolutionView: toImage(artworkMedia.find((asset) => asset.role === "high_resolution")),
    };
    return artwork;
  });
}

export async function getPublicArtwork(slug: string): Promise<Artwork | undefined> {
  return (await getPublicArtworks()).find((artwork) => artwork.slug === slug);
}

export async function getPublicExhibitions(): Promise<Exhibition[]> {
  const supabase = createPublicSupabaseClient();
  const { data: records, error } = await supabase
    .from("exhibitions")
    .select("*")
    .eq("is_published", true)
    .order("sort_order")
    .order("start_date", { ascending: false });
  throwIfError(error, "nie udało się pobrać wystaw");
  if (!records?.length) return [];

  const { data: assets, error: mediaError } = await supabase
    .from("media_assets")
    .select("*")
    .in("exhibition_id", records.map((record) => record.id))
    .eq("is_public", true)
    .order("sort_order");
  throwIfError(mediaError, "nie udało się pobrać zdjęć wystaw");

  return records.map((record) => {
    const asset = (assets ?? []).find((item) => item.exhibition_id === record.id);
    const image = asset ? (() => {
      const { data } = supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path);
      return { src: data.publicUrl, alt: asset.alt_text || record.title, width: asset.width || 1200, height: asset.height || 800 };
    })() : undefined;
    return {
      id: record.id,
      slug: record.slug,
      title: record.title,
      venue: record.venue || undefined,
      startDate: record.start_date || undefined,
      endDate: record.end_date || undefined,
      description: record.description || undefined,
      image,
    };
  });
}

export async function getPublicExhibition(slug: string): Promise<Exhibition | undefined> {
  return (await getPublicExhibitions()).find((exhibition) => exhibition.slug === slug);
}
