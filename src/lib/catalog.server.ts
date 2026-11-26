import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { getRequestPreferences } from "@/lib/i18n.server";
import type { Artwork, Exhibition, MediaAsset } from "@/lib/catalog";

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
  const { language, currency } = await getRequestPreferences();
  const [mediaResult, translationsResult, pricesResult] = await Promise.all([
    supabase.from("media_assets").select("*").in("artwork_id", artworkIds).eq("is_public", true),
    supabase.from("artwork_translations").select("*").in("artwork_id", artworkIds).eq("language_code", language.code),
    supabase.from("artwork_prices").select("*").in("artwork_id", artworkIds).eq("currency_code", currency),
  ]);
  throwIfError(mediaResult.error, "nie udało się pobrać zdjęć dzieł");
  throwIfError(translationsResult.error, "nie udało się pobrać tłumaczeń dzieł");
  throwIfError(pricesResult.error, "nie udało się pobrać cen dzieł");
  const assets = mediaResult.data;

  return records.map((record) => {
    const translation = translationsResult.data?.find((item) => item.artwork_id === record.id);
    const title = translation?.title?.trim() || record.title;
    const artworkMedia = (assets ?? [])
      .filter((asset) => asset.artwork_id === record.id)
      .sort((first, second) => Number(first.sort_order ?? 0) - Number(second.sort_order ?? 0) || first.created_at.localeCompare(second.created_at));
    const toImage = (asset: NonNullable<typeof assets>[number] | undefined): MediaAsset | undefined => {
      if (!asset) return undefined;
      const { data } = supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path);
      return {
        src: data.publicUrl,
        alt: language.code === "pl" ? asset.alt_text || title || "Obraz" : title || asset.alt_text || "Artwork",
        width: asset.width || 1200,
        height: asset.height || 900,
      };
    };
    const thumbnailAsset = artworkMedia.find((asset) => asset.role === "thumbnail")
      ?? artworkMedia.find((asset) => asset.id === record.image_id);
    const artwork: Artwork = {
      id: record.id,
      slug: record.slug,
      title: title ?? undefined,
      description: translation?.description?.trim() || record.description || undefined,
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
      price: pricesResult.data?.find((item) => item.artwork_id === record.id)?.amount,
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

  const { language } = await getRequestPreferences();
  const { data: translations, error: translationError } = await supabase.from("exhibition_translations").select("*").in("exhibition_id", records.map((record) => record.id)).eq("language_code", language.code);
  throwIfError(translationError, "nie udało się pobrać tłumaczeń wystaw");

  const { data: assets, error: mediaError } = await supabase
    .from("media_assets")
    .select("*")
    .in("exhibition_id", records.map((record) => record.id))
    .eq("is_public", true)
    .order("sort_order");
  throwIfError(mediaError, "nie udało się pobrać zdjęć wystaw");

  return records.map((record) => {
    const translation = translations?.find((item) => item.exhibition_id === record.id);
    const asset = (assets ?? []).find((item) => item.exhibition_id === record.id);
    const image = asset ? (() => {
      const { data } = supabase.storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path);
      return { src: data.publicUrl, alt: language.code === "pl" ? asset.alt_text || record.title : translation?.title?.trim() || record.title, width: asset.width || 1200, height: asset.height || 800 };
    })() : undefined;
    return {
      id: record.id,
      slug: record.slug,
      title: translation?.title?.trim() || record.title,
      venue: record.venue || undefined,
      startDate: record.start_date || undefined,
      endDate: record.end_date || undefined,
      description: translation?.description?.trim() || record.description || undefined,
      image,
    };
  });
}

export async function getPublicExhibition(slug: string): Promise<Exhibition | undefined> {
  return (await getPublicExhibitions()).find((exhibition) => exhibition.slug === slug);
}
