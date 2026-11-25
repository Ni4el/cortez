"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Row = Record<string, string | number | boolean | null | undefined>;
type Artwork = Row & { id: string; slug: string; title: string | null; image_id: string | null };
type Tag = Row & { id: string; name: string };
type Room = Row & { id: string; slug: string; label: string | null; parent_room_id: string | null; is_primary: boolean };
type Exhibition = Row & { id: string; slug: string; title: string };
type Media = Row & { id: string; artwork_id: string | null; room_id: string | null; exhibition_id: string | null; storage_bucket: string; storage_path: string; role: string };
type Author = Row & { id: string; slug: string; name: string };
type Section = "photos" | "tags" | "authors" | "gallery" | "exhibitions";

const sections: { id: Section; label: string }[] = [
  { id: "photos", label: "Zdjęcia" },
  { id: "tags", label: "Tagi" },
  { id: "authors", label: "Autorzy" },
  { id: "gallery", label: "Galeria" },
  { id: "exhibitions", label: "Wystawy" },
];

const emptyArtwork = {
  slug: "", title: "", description: "", year: "", sale_mode: "inquiry", availability: "available",
  method: "Olej na płótnie", size: "", place: "", author: "", price_pln: "", publication_status: "published", frame: "", is_main: "false", order: "0",
};
const emptyRoom = { slug: "", label: "", parent_room_id: "", is_primary: false, is_published: false, sort_order: "0" };
const emptyExhibition = { slug: "", title: "", venue: "", start_date: "", end_date: "", description: "", is_published: false, sort_order: "0" };
const emptyAuthor = { slug: "", name: "" };

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function messageFrom(error: { message?: string } | null, fallback: string) {
  return error?.message || fallback;
}

function ImageField({ label = "Zdjęcia", id, current, multiple = false, onChange }: { label?: string; id: string; current?: string; multiple?: boolean; onChange: (files: File[]) => void }) {
  return <label className="admin-field">{label}{current && <a className="admin-current-image" href={current} target="_blank" rel="noreferrer">Otwórz obecne zdjęcie</a>}<input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={multiple} onChange={(event) => onChange(Array.from(event.target.files ?? []))} />{multiple && <small>Możesz wybrać kilka zdjęć naraz.</small>}</label>;
}

export default function AdminPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState<Section>("photos");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artworkSortField, setArtworkSortField] = useState<"order" | "title">("order");
  const [artworkSortDirection, setArtworkSortDirection] = useState<"asc" | "desc">("asc");
  const [tags, setTags] = useState<Tag[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [artworkTags, setArtworkTags] = useState<{ artwork_id: string; tag_id: string }[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [authorForm, setAuthorForm] = useState<Record<string, string>>(emptyAuthor);
  const [roomArtwork, setRoomArtwork] = useState<{ artwork_id: string; room_id: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [artworkForm, setArtworkForm] = useState<Record<string, string>>(emptyArtwork);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [artworkFiles, setArtworkFiles] = useState<File[]>([]);
  const [fileResetKey, setFileResetKey] = useState(0);
  const [tagName, setTagName] = useState("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState<Record<string, string | boolean>>(emptyRoom);
  const [roomFile, setRoomFile] = useState<File | null>(null);
  const [assignArtwork, setAssignArtwork] = useState("");
  const [assignRoom, setAssignRoom] = useState("");
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [exhibitionForm, setExhibitionForm] = useState<Record<string, string | boolean>>(emptyExhibition);
  const [exhibitionFile, setExhibitionFile] = useState<File | null>(null);

  const verifyAndLoad = useCallback(async function verifyAndLoad() {
    if (!supabase) { setError("Brakuje NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY w pliku .env.local."); setChecking(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSignedIn(false); setChecking(false); return; }
    const { data: admin, error: accessError } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (accessError || !admin) {
      setSignedIn(false);
      setError("To konto nie ma dostępu do panelu. Dodaj jego UUID do tabeli admin_users w Supabase.");
      await supabase.auth.signOut();
      setChecking(false);
      return;
    }
    setSignedIn(true);
    const results = await Promise.all([
      supabase.from("artworks").select("*").order("created_at", { ascending: false }),
      supabase.from("tags").select("*").order("name"),
      supabase.from("authors").select("*").order("name"),
      supabase.from("rooms").select("*").order("sort_order"),
      supabase.from("exhibitions").select("*").order("sort_order"),
      supabase.from("media_assets").select("*"),
      supabase.from("artwork_tags").select("artwork_id,tag_id"),
      supabase.from("room_artworks").select("artwork_id,room_id"),
    ]);
    const failed = results.find((result) => result.error)?.error;
    if (failed) setError(messageFrom(failed, "Nie udało się pobrać danych panelu."));
    setArtworks((results[0].data ?? []) as Artwork[]);
    setTags((results[1].data ?? []) as Tag[]);
    setAuthors((results[2].data ?? []) as Author[]);
    setRooms((results[3].data ?? []) as Room[]);
    setExhibitions((results[4].data ?? []) as Exhibition[]);
    setMedia((results[5].data ?? []) as Media[]);
    setArtworkTags((results[6].data ?? []) as { artwork_id: string; tag_id: string }[]);
    setRoomArtwork((results[7].data ?? []) as { artwork_id: string; room_id: string }[]);
    if (!editingArtwork) {
      setSelectedTags([]);
      setArtworkFiles([]);
    }
    setChecking(false);
  }, [supabase, editingArtwork]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void verifyAndLoad(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [verifyAndLoad]);

  function clearMessages() { setNotice(""); setError(""); }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); clearMessages(); setBusy(true);
    if (!supabase) { setBusy(false); return; }
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) { setError(result.error.message); setBusy(false); return; }
    setChecking(true);
    await verifyAndLoad();
    setBusy(false);
  }

  async function upload(file: File, path: string) {
    if (!supabase) throw new Error("Brak konfiguracji Supabase.");
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 20 * 1024 * 1024) throw new Error("Wybierz zdjęcie JPG, PNG, WebP lub AVIF do 20 MB.");
    const bitmap = await createImageBitmap(file);
    const width = bitmap.width;
    const height = bitmap.height;
    bitmap.close();
    const cleanName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-");
    const storagePath = `${path}/${crypto.randomUUID()}-${cleanName}`;
    const { error: uploadError } = await supabase.storage.from("portfolio").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    return { storagePath, publicUrl: supabase.storage.from("portfolio").getPublicUrl(storagePath).data.publicUrl, width, height };
  }

  async function deleteFiles(assets: Media[]) {
    if (!supabase) throw new Error("Brak konfiguracji Supabase.");
    const byBucket = new Map<string, string[]>();
    assets.forEach((asset) => byBucket.set(asset.storage_bucket, [...(byBucket.get(asset.storage_bucket) ?? []), asset.storage_path]));
    for (const [bucket, paths] of byBucket) {
      const { error: storageError } = await supabase.storage.from(bucket).remove(paths);
      if (storageError) throw new Error(`Nie udało się usunąć plików ze Storage: ${storageError.message}`);
    }
  }

  function resetArtworkForm() {
    setEditingArtwork(null);
    setArtworkForm(emptyArtwork);
    setSelectedTags([]);
    setArtworkFiles([]);
    setFileResetKey((prev) => prev + 1);
  }

  function editArtwork(artwork: Artwork) {
    setEditingArtwork(artwork);
    const next = { ...emptyArtwork };
    Object.keys(emptyArtwork).forEach((key) => { next[key as keyof typeof emptyArtwork] = String(artwork[key] ?? "") as never; });
    setArtworkForm(next);
    setSelectedTags(artworkTags.filter((link) => link.artwork_id === artwork.id).map((link) => link.tag_id));
    setArtworkFiles([]);
    setFileResetKey((prev) => prev + 1);
  }

  async function saveArtwork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); clearMessages(); setBusy(true);
    if (!supabase) { setBusy(false); return; }
    let createdArtworkId: string | undefined;
    const previousImageId = editingArtwork?.image_id ?? null;
    const uploadedPaths: string[] = [];
    const insertedMediaIds: string[] = [];
    let primaryImageUpdated = false;
    try {
      const slug = slugify(artworkForm.slug || artworkForm.title);
      if (!slug) throw new Error("Podaj tytuł lub slug dzieła.");
      const payload = {
        ...artworkForm,
        slug,
        title: artworkForm.title || null,
        description: artworkForm.description || null,
        year: artworkForm.year || null,
        price_pln: artworkForm.price_pln ? Number(artworkForm.price_pln) : null,
        author: artworkForm.author || null,
        method: artworkForm.method || null,
        size: artworkForm.size || null,
        place: artworkForm.place || null,
        frame: artworkForm.frame || null,
        order: Number(artworkForm.order || 0),
        is_main: artworkForm.is_main === "true",
      };
      if (payload.is_main) {
        const { error: clearMainError } = await supabase.from("artworks").update({ is_main: false }).eq("is_main", true);
        if (clearMainError) throw clearMainError;
      }
      let artworkId = editingArtwork?.id;
      if (artworkId) {
        const { error: updateError } = await supabase.from("artworks").update(payload).eq("id", artworkId);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase.from("artworks").insert(payload).select("id").single();
        if (insertError) throw insertError;
        artworkId = String(data.id);
        createdArtworkId = artworkId;
      }
      if (!artworkId) throw new Error("Nie udało się utworzyć identyfikatora dzieła.");
      const { error: clearTagError } = await supabase.from("artwork_tags").delete().eq("artwork_id", artworkId);
      if (clearTagError) throw clearTagError;
      if (selectedTags.length) {
        const { error: tagError } = await supabase.from("artwork_tags").insert(selectedTags.map((tag_id) => ({ artwork_id: artworkId, tag_id })));
        if (tagError) throw tagError;
      }
      if (artworkFiles.length && artworkId) {
        const currentImages = media.filter((asset) => asset.artwork_id === artworkId);
        const hasThumbnail = currentImages.some((asset) => asset.role === "thumbnail");
        const nextSortOrder = Math.max(-1, ...currentImages.map((asset) => Number(asset.sort_order ?? 0))) + 1;
        for (const [index, file] of artworkFiles.entries()) {
          const uploaded = await upload(file, `artworks/${artworkId}`);
          uploadedPaths.push(uploaded.storagePath);
          const role = !hasThumbnail && index === 0 ? "thumbnail" : "high_resolution";
          const imagePayload = { storage_bucket: "portfolio", storage_path: uploaded.storagePath, role, mime_type: file.type, width: uploaded.width, height: uploaded.height, byte_size: file.size, alt_text: artworkForm.title || file.name, is_public: true, artwork_id: artworkId, room_id: null, exhibition_id: null, sort_order: role === "thumbnail" ? 0 : nextSortOrder + index };
          const { data: insertedMedia, error: mediaError } = await supabase.from("media_assets").insert(imagePayload).select("id").single();
          if (mediaError) throw mediaError;
          insertedMediaIds.push(String(insertedMedia.id));
          if (role === "thumbnail") {
            const { error: artworkImageError } = await supabase.from("artworks").update({ image_id: String(insertedMedia.id) }).eq("id", artworkId);
            if (artworkImageError) throw artworkImageError;
            primaryImageUpdated = true;
          }
        }
      }
      uploadedPaths.length = 0;
      createdArtworkId = undefined;
      setNotice("Dzieło zapisano.");
      resetArtworkForm();
      await verifyAndLoad();
    } catch (cause) {
      const messages = [messageFrom(cause as { message?: string }, "Nie udało się zapisać dzieła.")];
      if (editingArtwork && primaryImageUpdated) {
        const { error: restoreError } = await supabase.from("artworks").update({ image_id: previousImageId }).eq("id", editingArtwork.id);
        if (restoreError) messages.push(`Nie udało się przywrócić zdjęcia głównego: ${restoreError.message}`);
      }
      if (insertedMediaIds.length) {
        const { error: mediaCleanupError } = await supabase.from("media_assets").delete().in("id", insertedMediaIds);
        if (mediaCleanupError) messages.push(`Nie udało się wycofać wpisów zdjęć: ${mediaCleanupError.message}`);
      }
      if (createdArtworkId) {
        const { error: rollbackError } = await supabase.from("artworks").delete().eq("id", createdArtworkId);
        if (rollbackError) messages.push(`Nie udało się wycofać niekompletnego dzieła: ${rollbackError.message}`);
      }
      if (uploadedPaths.length) {
        const { error: cleanupError } = await supabase.storage.from("portfolio").remove(uploadedPaths);
        if (cleanupError) messages.push(`Nie udało się usunąć niepodpiętych plików: ${cleanupError.message}`);
      }
      setError(messages.join(" "));
    }
    finally { setBusy(false); }
  }

  async function removeArtwork(artwork: Artwork) {
    if (!supabase || !window.confirm(`Usunąć dzieło „${artwork.title || artwork.slug}” wraz ze zdjęciami ze Storage?`)) return;
    clearMessages(); setBusy(true);
    try {
      const assets = media.filter((asset) => asset.artwork_id === artwork.id);
      const { error: deleteError } = await supabase.from("artworks").delete().eq("id", artwork.id);
      if (deleteError) throw deleteError;
      await deleteFiles(assets);
      setNotice("Dzieło i pliki zdjęć usunięto."); await verifyAndLoad();
    } catch (cause) { setError(messageFrom(cause as { message?: string }, "Nie udało się usunąć dzieła.")); await verifyAndLoad(); }
    finally { setBusy(false); }
  }

  async function removeArtworkImage(artwork: Artwork, asset: Media) {
    if (!supabase || !window.confirm("Usunąć to zdjęcie z bazy i fizycznie ze Storage?")) return;
    clearMessages(); setBusy(true);
    try {
      if (artwork.image_id === asset.id) {
        const replacement = media
          .filter((image) => image.artwork_id === artwork.id && image.id !== asset.id && (image.role === "thumbnail" || image.role === "high_resolution"))
          .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))[0];
        const { error: updateError } = await supabase.from("artworks").update({ image_id: replacement?.id ?? null }).eq("id", artwork.id);
        if (updateError) throw updateError;
      }
      const { error: mediaError } = await supabase.from("media_assets").delete().eq("id", asset.id);
      if (mediaError) throw mediaError;
      await deleteFiles([asset]);
      setNotice("Zdjęcie usunięto.");
      await verifyAndLoad();
    } catch (cause) { setError(messageFrom(cause as { message?: string }, "Nie udało się usunąć zdjęcia.")); }
    finally { setBusy(false); }
  }

  async function saveTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); clearMessages(); setBusy(true);
    if (!supabase) { setBusy(false); return; }
    const cleanName = tagName.trim();
    if (!cleanName) { setError("Nazwa tagu nie może być pusta."); setBusy(false); return; }
    const result = editingTag
      ? await supabase.from("tags").update({ name: cleanName }).eq("id", editingTag.id)
      : await supabase.from("tags").insert({ name: cleanName });
    if (result.error) setError(result.error.message);
    else { setTagName(""); setEditingTag(null); setNotice("Tag zapisano."); await verifyAndLoad(); }
    setBusy(false);
  }

  async function removeTag(tag: Tag) {
    if (!supabase || !window.confirm(`Usunąć tag „${tag.name}” ze wszystkich przypisań?`)) return;
    const result = await supabase.from("tags").delete().eq("id", tag.id);
    if (result.error) setError(result.error.message); else { setNotice("Tag usunięto."); await verifyAndLoad(); }
  }

  async function saveAuthor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); clearMessages(); setBusy(true);
    if (!supabase) { setBusy(false); return; }
    try {
      const slug = slugify(authorForm.slug || authorForm.name);
      if (!slug) throw new Error("Podaj nazwę autora.");
      const payload = { slug, name: authorForm.name.trim() || null };
      let id = editingAuthor?.id;
      if (id) { const { error: saveError } = await supabase.from("authors").update(payload).eq("id", id); if (saveError) throw saveError; }
      else { const { data, error: saveError } = await supabase.from("authors").insert(payload).select("id").single(); if (saveError) throw saveError; id = String(data.id); }
      setNotice("Autora zapisano.");
      resetAuthorForm();
      await verifyAndLoad();
    } catch (cause) { setError(messageFrom(cause as { message?: string }, "Nie udało się zapisać autora.")); }
    finally { setBusy(false); }
  }

  async function removeAuthor(author: Author) {
    if (!supabase || !window.confirm(`Usunąć autora „${author.name}”? Dzieła przypisane do tego autora będą miały autora ustawionego na pustego.`)) return;
    clearMessages(); setBusy(true);
    try {
      const { error: deleteError } = await supabase.from("authors").delete().eq("id", author.id);
      if (deleteError) throw deleteError;
      setNotice("Autora usunięto."); await verifyAndLoad();
    } catch (cause) { setError(messageFrom(cause as { message?: string }, "Nie udało się usunąć autora.")); }
    finally { setBusy(false); }
  }

  function editAuthor(author: Author) {
    setEditingAuthor(author);
    setAuthorForm({ slug: author.slug, name: author.name });
  }

  function resetAuthorForm() {
    setEditingAuthor(null);
    setAuthorForm(emptyAuthor);
  }

  function editRoom(room: Room) {
    setEditingRoom(room);
    setRoomForm({ slug: room.slug, label: room.label ?? "", parent_room_id: room.parent_room_id ?? "", is_primary: room.is_primary, is_published: Boolean(room.is_published), sort_order: String(room.sort_order ?? 0) });
    setRoomFile(null);
  }

  async function saveRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); clearMessages(); setBusy(true);
    if (!supabase) { setBusy(false); return; }
    try {
      const slug = slugify(String(roomForm.slug || roomForm.label));
      const isPrimary = roomForm.is_primary === true;
      const parentId = isPrimary ? null : String(roomForm.parent_room_id || "");
      if (!slug) throw new Error("Podaj nazwę pomieszczenia.");
      if (isPrimary && rooms.some((room) => room.is_primary && room.id !== editingRoom?.id)) throw new Error("Można utworzyć tylko jedno pomieszczenie główne.");
      if (editingRoom?.is_primary && !isPrimary && rooms.some((room) => room.parent_room_id === editingRoom.id)) throw new Error("Najpierw przenieś lub usuń pomieszczenia podrzędne.");
      if (!isPrimary && !parentId) throw new Error("Wybierz pomieszczenie główne dla tej sali.");
      let roomId = editingRoom?.id;
      const payload = { slug, label: String(roomForm.label || slug), parent_room_id: parentId || null, is_primary: isPrimary, is_published: roomForm.is_published === true, sort_order: Number(roomForm.sort_order || 0) };
      if (roomId) { const { error: saveError } = await supabase.from("rooms").update(payload).eq("id", roomId); if (saveError) throw saveError; }
        else { const { data, error: saveError } = await supabase.from("rooms").insert(payload).select("id").single(); if (saveError) throw saveError; roomId = String(data.id); }
      if (roomFile && roomId) {
        const existing = media.find((asset) => asset.room_id === roomId && asset.role === "room_image");
        const uploaded = await upload(roomFile, `rooms/${roomId}`);
        const imagePayload = { storage_bucket: "portfolio", storage_path: uploaded.storagePath, role: "room_image", mime_type: roomFile.type, width: uploaded.width, height: uploaded.height, byte_size: roomFile.size, alt_text: String(roomForm.label || slug), is_public: true, artwork_id: null, room_id: roomId, exhibition_id: null };
        if (existing) { const { error: saveError } = await supabase.from("media_assets").update(imagePayload).eq("id", existing.id); if (saveError) throw saveError; await deleteFiles([existing]); }
        else { const { error: saveError } = await supabase.from("media_assets").insert(imagePayload); if (saveError) throw saveError; }
      }
      setNotice("Pomieszczenie zapisano."); setEditingRoom(null); setRoomForm(emptyRoom); await verifyAndLoad();
    } catch (cause) { setError(messageFrom(cause as { message?: string }, "Nie udało się zapisać pomieszczenia.")); }
    finally { setBusy(false); }
  }

  async function removeRoom(room: Room) {
    if (!supabase || !window.confirm(`Usunąć pomieszczenie „${room.label || room.slug}”?`)) return;
    const children = rooms.filter((candidate) => candidate.parent_room_id === room.id);
    if (children.length) { setError("Najpierw usuń lub przenieś pomieszczenia podrzędne."); return; }
    const assets = media.filter((asset) => asset.room_id === room.id);
    const result = await supabase.from("rooms").delete().eq("id", room.id);
    if (result.error) setError(result.error.message);
    else { try { await deleteFiles(assets); setNotice("Pomieszczenie usunięto."); } catch (cause) { setError(messageFrom(cause as { message?: string }, "Pomieszczenie usunięto, ale część plików pozostała w Storage.")); } await verifyAndLoad(); }
  }

  async function saveRoomArtwork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); clearMessages();
    if (!supabase || !assignArtwork || !assignRoom) { setError("Wybierz dzieło i pomieszczenie podrzędne."); return; }
    const existing = roomArtwork.find((link) => link.artwork_id === assignArtwork);
    if (existing && existing.room_id !== assignRoom) {
      const current = rooms.find((room) => room.id === existing.room_id);
      setError(`To dzieło jest już przypisane do „${current?.label || current?.slug || "innego pomieszczenia"}”. Usuń to przypisanie przed zmianą sali.`);
      return;
    }
    const result = existing
      ? await supabase.from("room_artworks").update({ room_id: assignRoom }).eq("artwork_id", assignArtwork)
      : await supabase.from("room_artworks").insert({ artwork_id: assignArtwork, room_id: assignRoom });
    if (result.error) setError(result.error.message); else { setNotice("Dzieło przypisano do pomieszczenia."); await verifyAndLoad(); }
  }

  async function unassignArtwork(artworkId: string) {
    if (!supabase) return;
    const result = await supabase.from("room_artworks").delete().eq("artwork_id", artworkId);
    if (result.error) setError(result.error.message); else { setNotice("Usunięto przypisanie dzieła do sali."); await verifyAndLoad(); }
  }

  function editExhibition(exhibition: Exhibition) {
    setEditingExhibition(exhibition);
    setExhibitionForm({ slug: exhibition.slug, title: exhibition.title, venue: String(exhibition.venue ?? ""), start_date: String(exhibition.start_date ?? ""), end_date: String(exhibition.end_date ?? ""), description: String(exhibition.description ?? ""), is_published: Boolean(exhibition.is_published), sort_order: String(exhibition.sort_order ?? 0) });
    setExhibitionFile(null);
  }

  async function saveExhibition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); clearMessages(); setBusy(true);
    if (!supabase) { setBusy(false); return; }
    try {
      const slug = slugify(String(exhibitionForm.slug || exhibitionForm.title));
      if (!slug || !String(exhibitionForm.title).trim()) throw new Error("Uzupełnij tytuł wystawy.");
      const payload = { slug, title: String(exhibitionForm.title).trim(), venue: String(exhibitionForm.venue || "") || null, start_date: String(exhibitionForm.start_date || "") || null, end_date: String(exhibitionForm.end_date || "") || null, description: String(exhibitionForm.description || "") || null, is_published: exhibitionForm.is_published === true, sort_order: Number(exhibitionForm.sort_order || 0) };
      let id = editingExhibition?.id;
      if (id) { const { error: saveError } = await supabase.from("exhibitions").update(payload).eq("id", id); if (saveError) throw saveError; }
      else { const { data, error: saveError } = await supabase.from("exhibitions").insert(payload).select("id").single(); if (saveError) throw saveError; id = String(data.id); }
      if (exhibitionFile && id) {
        const existing = media.find((asset) => asset.exhibition_id === id);
        const uploaded = await upload(exhibitionFile, `exhibitions/${id}`);
        const imagePayload = { storage_bucket: "portfolio", storage_path: uploaded.storagePath, role: "room_image", mime_type: exhibitionFile.type, width: uploaded.width, height: uploaded.height, byte_size: exhibitionFile.size, alt_text: String(exhibitionForm.title), is_public: true, artwork_id: null, room_id: null, exhibition_id: id };
        if (existing) { const { error: saveError } = await supabase.from("media_assets").update(imagePayload).eq("id", existing.id); if (saveError) throw saveError; await deleteFiles([existing]); }
        else { const { error: saveError } = await supabase.from("media_assets").insert(imagePayload); if (saveError) throw saveError; }
      }
      setNotice("Wystawę zapisano."); setEditingExhibition(null); setExhibitionForm(emptyExhibition); await verifyAndLoad();
    } catch (cause) { setError(messageFrom(cause as { message?: string }, "Nie udało się zapisać wystawy.")); }
    finally { setBusy(false); }
  }

  async function removeExhibition(exhibition: Exhibition) {
    if (!supabase || !window.confirm(`Usunąć wystawę „${exhibition.title}” wraz z okładką?`)) return;
    const assets = media.filter((asset) => asset.exhibition_id === exhibition.id);
    const result = await supabase.from("exhibitions").delete().eq("id", exhibition.id);
    if (result.error) setError(result.error.message);
    else { try { await deleteFiles(assets); setNotice("Wystawę i jej pliki usunięto."); } catch (cause) { setError(messageFrom(cause as { message?: string }, "Wystawę usunięto, ale nie wszystkie pliki.")); } await verifyAndLoad(); }
  }

  async function logout() { await supabase?.auth.signOut(); setSignedIn(false); }

  if (checking) return <section className="admin-panel"><p>Sprawdzam dostęp do panelu…</p></section>;
  if (!signedIn) return <section className="admin-panel admin-login"><p className="eyebrow">Portfolio Cortez</p><h1>Panel administracyjny</h1><p>Zaloguj się na przypisane konto.</p>{error && <p className="admin-error">{error}</p>}<form onSubmit={handleLogin} className="admin-form"><label className="admin-field">E-mail<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="admin-field">Hasło<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="button" disabled={busy}>{busy ? "Logowanie…" : "Zaloguj się"}</button></form></section>;

  return <section className="admin-panel">
    <header className="admin-heading"><div><p className="eyebrow">Portfolio Cortez</p><h1>Panel administracyjny</h1></div><button type="button" className="admin-button" onClick={() => void logout()}>Wyloguj</button></header>
    <nav className="admin-tabs" aria-label="Sekcje panelu">{sections.map((item) => <button key={item.id} type="button" className={section === item.id ? "is-active" : ""} onClick={() => { clearMessages(); setSection(item.id); resetArtworkForm(); resetAuthorForm(); }}>{item.label}</button>)}</nav>
    {notice && <p className="admin-notice" role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}

    {section === "photos" && (() => {
      const sortedAdminArtworks = [...artworks].sort((a, b) => {
        if (artworkSortField === "order") {
          const orderA = Number(a.order ?? 0);
          const orderB = Number(b.order ?? 0);
          if (orderA !== orderB) {
            return artworkSortDirection === "asc" ? orderA - orderB : orderB - orderA;
          }
          const titleA = String(a.title || a.slug || "").toLowerCase();
          const titleB = String(b.title || b.slug || "").toLowerCase();
          return titleA.localeCompare(titleB, "pl");
        } else {
          const titleA = String(a.title || a.slug || "").toLowerCase();
          const titleB = String(b.title || b.slug || "").toLowerCase();
          const cmp = titleA.localeCompare(titleB, "pl");
          if (cmp !== 0) {
            return artworkSortDirection === "asc" ? cmp : -cmp;
          }
          const orderA = Number(a.order ?? 0);
          const orderB = Number(b.order ?? 0);
          return artworkSortDirection === "asc" ? orderA - orderB : orderB - orderA;
        }
      });

      return <div className="admin-columns"><div><div className="admin-section-title"><h2>Dzieła i zdjęcia</h2><button className="admin-button" type="button" onClick={resetArtworkForm}>+ Dodaj dzieło</button></div>
        <div className="admin-sort-bar">
          <span>Sortuj po:</span>
          <select value={artworkSortField} onChange={(e) => setArtworkSortField(e.target.value as "order" | "title")} aria-label="Pole sortowania">
            <option value="order">Kolejność (order)</option>
            <option value="title">Nazwa (tytuł)</option>
          </select>
          <button type="button" className="admin-button" onClick={() => setArtworkSortDirection((dir) => (dir === "asc" ? "desc" : "asc"))} title={artworkSortDirection === "asc" ? "Zmień na malejąco (DESC)" : "Zmień na rosnąco (ASC)"}>
            {artworkSortDirection === "asc" ? "ASC ↑" : "DESC ↓"}
          </button>
        </div>
        <div className="admin-list">{sortedAdminArtworks.map((artwork) => { const image = media.find((asset) => asset.id === artwork.image_id) ?? media.find((asset) => asset.artwork_id === artwork.id && asset.role === "thumbnail"); const src = image ? supabase?.storage.from(image.storage_bucket).getPublicUrl(image.storage_path).data.publicUrl : null; return <article className="admin-row" key={artwork.id}>{src && <Image src={src} alt="" width={64} height={64} unoptimized />}<div><strong>{artwork.title || artwork.slug}</strong><small>Kolejność: {String(artwork.order ?? 0)} · {artwork.slug} · {String(artwork.publication_status || "draft")}</small></div><button className="admin-button" type="button" onClick={() => editArtwork(artwork)}>Edytuj</button><button className="admin-button admin-danger" type="button" onClick={() => void removeArtwork(artwork)}>Usuń</button></article>; })}{!sortedAdminArtworks.length && <p>Brak dzieł w bazie.</p>}</div></div>
      <form className="admin-form admin-editor" onSubmit={saveArtwork} autoComplete="off"><h2>{editingArtwork ? "Edycja dzieła" : "Nowe dzieło"}</h2><ImageField id="artwork-image" key={`artwork-image-${editingArtwork?.id ?? "new"}-${fileResetKey}`} multiple onChange={setArtworkFiles} />
        {artworkFiles.length > 0 && (
          <div className="admin-pending-files">
            <span className="admin-pending-files-title">Wybrane pliki do wgrania ({artworkFiles.length}):</span>
            <ul>
              {artworkFiles.map((file, idx) => (
                <li key={`${file.name}-${idx}`}>
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="admin-button"
              onClick={() => {
                setArtworkFiles([]);
                setFileResetKey((prev) => prev + 1);
              }}
            >
              Wyczyść wybrane pliki
            </button>
          </div>
        )}
        {editingArtwork && <div className="admin-image-list"><h3>Zdjęcia zapisane przy dziele</h3>{media.filter((asset) => asset.artwork_id === editingArtwork.id && (asset.role === "thumbnail" || asset.role === "high_resolution")).sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)).map((asset) => { const src = supabase?.storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path).data.publicUrl; return <article className="admin-image-row" key={asset.id}>{src && <Image src={src} alt={String(asset.alt_text ?? "")} width={88} height={88} unoptimized />}<span>{asset.role === "thumbnail" ? "Główne" : "Dodatkowe"}</span><button className="admin-button admin-danger" type="button" disabled={busy} onClick={() => void removeArtworkImage(editingArtwork, asset)}>Usuń zdjęcie</button></article>; })}{!media.some((asset) => asset.artwork_id === editingArtwork.id && (asset.role === "thumbnail" || asset.role === "high_resolution")) && <p>To dzieło nie ma jeszcze zapisanych zdjęć.</p>}</div>}
        <label className="admin-field">Tytuł<input value={artworkForm.title} onChange={(event) => setArtworkForm({ ...artworkForm, title: event.target.value })} /></label>
        <label className="admin-field">Slug<input value={artworkForm.slug} onChange={(event) => setArtworkForm({ ...artworkForm, slug: event.target.value })} placeholder="tworzy-się-z-tytułu" /></label>
        <label className="admin-field">Opis<textarea rows={4} value={artworkForm.description} onChange={(event) => setArtworkForm({ ...artworkForm, description: event.target.value })} /></label>
        <div className="admin-field-grid">{[["year","Rok"],["size","Rozmiar"],["place","Miejsce"],["frame","Rama"],["price_pln","Cena PLN"],["order","Kolejność"]].map(([key,label]) => <label className="admin-field" key={key}>{label}<input type={key === "order" || key === "price_pln" ? "number" : "text"} value={artworkForm[key]} onChange={(event) => setArtworkForm({ ...artworkForm, [key]: event.target.value })} /></label>)}</div>
        {[ ["availability","Dostępność",["available","reserved","sold","gifted","not_for_sale"]], ["publication_status","Publikacja",["draft","published","hidden"]], ["sale_mode","Tryb sprzedaży",["direct","inquiry","none"]], ["method","Technika",["","Olej na płycie","Olej na płótnie","Ołówek na papierze"]], ["author","Autor",authors.map((a) => a.id)] ].map(([key,label,options]) => <label className="admin-field" key={String(key)}>{String(label)}<select value={artworkForm[String(key)] ?? ""} onChange={(event) => setArtworkForm({ ...artworkForm, [String(key)]: event.target.value })}><option value="">—</option>{(options as string[]).map((option) => { const author = authors.find((a) => a.id === option); return <option key={option} value={option}>{author ? author.name : option}</option>})}</select></label>)}
        <label className="admin-check"><input type="checkbox" checked={artworkForm.is_main === "true"} onChange={(event) => setArtworkForm({ ...artworkForm, is_main: String(event.target.checked) })} /> Użyj jako tła strony głównej</label>
        <fieldset className="admin-tag-picker"><legend>Tagi {selectedTags.length > 0 && <button type="button" className="admin-tag-clear" onClick={() => setSelectedTags([])}>(odznacz wszystkie)</button>}</legend>{tags.map((tag) => <label key={tag.id}><input type="checkbox" id={`tag-${tag.id}`} name={`tag-${tag.id}`} autoComplete="off" checked={selectedTags.includes(tag.id)} onChange={(event) => setSelectedTags(event.target.checked ? [...selectedTags, tag.id] : selectedTags.filter((id) => id !== tag.id))} /> {tag.name}</label>)}{!tags.length && <small>Najpierw dodaj tagi w sekcji Tagi.</small>}</fieldset>
        <div className="admin-form-actions"><button className="button" disabled={busy}>{busy ? "Zapisuję…" : "Zapisz dzieło"}</button>{editingArtwork && <button type="button" className="admin-button" onClick={resetArtworkForm}>Anuluj edycję</button>}</div>
      </form></div>;
    })()}

    {section === "tags" && <div className="admin-columns"><div><h2>Tagi</h2><div className="admin-list">{tags.map((tag) => <article className="admin-row" key={tag.id}><strong>{tag.name}</strong><button className="admin-button" type="button" onClick={() => { setEditingTag(tag); setTagName(tag.name); }}>Edytuj</button><button className="admin-button admin-danger" type="button" onClick={() => void removeTag(tag)}>Usuń</button></article>)}{!tags.length && <p>Brak tagów.</p>}</div></div><form className="admin-form admin-editor" onSubmit={saveTag}><h2>{editingTag ? "Edycja tagu" : "Nowy tag"}</h2><label className="admin-field">Nazwa<input required value={tagName} onChange={(event) => setTagName(event.target.value)} /></label><div className="admin-form-actions"><button className="button" disabled={busy}>Zapisz tag</button>{editingTag && <button className="admin-button" type="button" onClick={() => { setEditingTag(null); setTagName(""); }}>Anuluj</button>}</div><p className="admin-help">Tag może być współdzielony przez wiele dzieł. Usunięcie odłącza go od wszystkich dzieł.</p></form></div>}
    {section === "authors" && <div className="admin-columns"><div><h2>Autorzy</h2><div className="admin-list">{authors.map((author) => <article className="admin-row" key={author.id}><strong>{author.name}</strong><small>{author.slug}</small><button className="admin-button" type="button" onClick={() => { setEditingAuthor(author); setAuthorForm({ slug: author.slug, name: author.name }); }}>Edytuj</button><button className="admin-button admin-danger" type="button" onClick={() => void removeAuthor(author)}>Usuń</button></article>)}{!authors.length && <p>Brak autorów.</p>}</div></div><form className="admin-form admin-editor" onSubmit={saveAuthor}><h2>{editingAuthor ? "Edycja autora" : "Nowy autor"}</h2><label className="admin-field">Nazwa<input required value={authorForm.name} onChange={(event) => setAuthorForm({ ...authorForm, name: event.target.value })} /></label><label className="admin-field">Slug<input value={authorForm.slug} onChange={(event) => setAuthorForm({ ...authorForm, slug: event.target.value })} placeholder="tworzy-się-z-nazwy" /></label><div className="admin-form-actions"><button className="button" disabled={busy}>{busy ? "Zapisuję…" : "Zapisz autora"}</button>{editingAuthor && <button className="admin-button" type="button" onClick={resetAuthorForm}>Anuluj</button>}</div><p className="admin-help">Autor może być przypisany do wielu dzieł. Usunięcie autora ustawia autora dzieła na pustego.</p></form></div>}

    {section === "gallery" && <div className="admin-columns"><div><div className="admin-section-title"><h2>Pomieszczenia</h2><button className="admin-button" type="button" onClick={() => { setEditingRoom(null); setRoomForm(emptyRoom); }}>+ Dodaj pomieszczenie</button></div><div className="admin-list">{rooms.map((room) => { const image = media.find((asset) => asset.room_id === room.id && asset.role === "room_image"); const src = image ? supabase?.storage.from(image.storage_bucket).getPublicUrl(image.storage_path).data.publicUrl : null; return <article className="admin-row" key={room.id}>{src && <Image src={src} alt="" width={64} height={64} unoptimized />}<div><strong>{room.label || room.slug}{room.is_primary ? " · główne" : ""}</strong><small>{room.parent_room_id ? `Podrzędne: ${rooms.find((r) => r.id === room.parent_room_id)?.label || "pomieszczenie główne"}` : "Pomieszczenie główne"}</small></div><button className="admin-button" type="button" onClick={() => editRoom(room)}>Edytuj</button><button className="admin-button admin-danger" type="button" onClick={() => void removeRoom(room)}>Usuń</button></article>; })}{!rooms.length && <p>Utwórz pomieszczenie główne, a następnie dodaj do niego sale.</p>}</div>
      <form className="admin-form admin-inline-form" onSubmit={saveRoomArtwork}><h2>Przypisz dzieło do sali</h2><label className="admin-field">Dzieło<select required value={assignArtwork} onChange={(event) => setAssignArtwork(event.target.value)}><option value="">Wybierz dzieło</option>{artworks.map((artwork) => <option key={artwork.id} value={artwork.id}>{artwork.title || artwork.slug}</option>)}</select></label><label className="admin-field">Pomieszczenie podrzędne<select required value={assignRoom} onChange={(event) => setAssignRoom(event.target.value)}><option value="">Wybierz salę</option>{rooms.filter((room) => Boolean(room.parent_room_id)).map((room) => <option key={room.id} value={room.id}>{room.label || room.slug}</option>)}</select></label><button className="button">Przypisz dzieło</button><div className="admin-list">{roomArtwork.map((link) => { const work = artworks.find((a) => a.id === link.artwork_id); const room = rooms.find((r) => r.id === link.room_id); return <article className="admin-row" key={link.artwork_id}><span>{work?.title || work?.slug} → {room?.label || room?.slug}</span><button className="admin-button admin-danger" type="button" onClick={() => void unassignArtwork(link.artwork_id)}>Odłącz</button></article>; })}</div></form></div>
      <form className="admin-form admin-editor" onSubmit={saveRoom}><h2>{editingRoom ? "Edycja pomieszczenia" : "Nowe pomieszczenie"}</h2><ImageField id="room-image" current={editingRoom ? (() => { const item = media.find((entry) => entry.room_id === editingRoom.id && entry.role === "room_image"); return item ? supabase?.storage.from(item.storage_bucket).getPublicUrl(item.storage_path).data.publicUrl : undefined; })() : undefined} onChange={(files) => setRoomFile(files[0] ?? null)} /><label className="admin-field">Nazwa<input required value={String(roomForm.label)} onChange={(event) => setRoomForm({ ...roomForm, label: event.target.value, slug: roomForm.slug || slugify(event.target.value) })} /></label><label className="admin-field">Slug<input value={String(roomForm.slug)} onChange={(event) => setRoomForm({ ...roomForm, slug: event.target.value })} /></label><label className="admin-check"><input type="checkbox" checked={roomForm.is_primary === true} onChange={(event) => setRoomForm({ ...roomForm, is_primary: event.target.checked, parent_room_id: "" })} /> Pomieszczenie główne</label>{roomForm.is_primary !== true && <label className="admin-field">Nadrzędne pomieszczenie<select required value={String(roomForm.parent_room_id)} onChange={(event) => setRoomForm({ ...roomForm, parent_room_id: event.target.value })}><option value="">Wybierz główne</option>{rooms.filter((room) => room.is_primary && room.id !== editingRoom?.id).map((room) => <option value={room.id} key={room.id}>{room.label || room.slug}</option>)}</select></label>}<label className="admin-field">Kolejność<input type="number" value={String(roomForm.sort_order)} onChange={(event) => setRoomForm({ ...roomForm, sort_order: event.target.value })} /></label><label className="admin-check"><input type="checkbox" checked={roomForm.is_published === true} onChange={(event) => setRoomForm({ ...roomForm, is_published: event.target.checked })} /> Opublikowane</label><div className="admin-form-actions"><button className="button" disabled={busy}>Zapisz pomieszczenie</button>{editingRoom && <button type="button" className="admin-button" onClick={() => { setEditingRoom(null); setRoomForm(emptyRoom); }}>Anuluj</button>}</div></form></div>}

    {section === "exhibitions" && <div className="admin-columns"><div><div className="admin-section-title"><h2>Wystawy</h2><button className="admin-button" type="button" onClick={() => { setEditingExhibition(null); setExhibitionForm(emptyExhibition); setExhibitionFile(null); }}>+ Dodaj wystawę</button></div><div className="admin-list">{exhibitions.map((exhibition) => { const image = media.find((asset) => asset.exhibition_id === exhibition.id); const src = image ? supabase?.storage.from(image.storage_bucket).getPublicUrl(image.storage_path).data.publicUrl : null; return <article className="admin-row" key={exhibition.id}>{src && <Image src={src} alt="" width={64} height={64} unoptimized />}<div><strong>{exhibition.title}</strong><small>{exhibition.slug} · {String(exhibition.venue || "bez miejsca")}</small></div><button className="admin-button" type="button" onClick={() => editExhibition(exhibition)}>Edytuj</button><button className="admin-button admin-danger" type="button" onClick={() => void removeExhibition(exhibition)}>Usuń</button></article>; })}{!exhibitions.length && <p>Brak wystaw.</p>}</div></div><form className="admin-form admin-editor" onSubmit={saveExhibition}><h2>{editingExhibition ? "Edycja wystawy" : "Nowa wystawa"}</h2><ImageField label="Okładka wystawy" id="exhibition-image" current={editingExhibition ? (() => { const item = media.find((entry) => entry.exhibition_id === editingExhibition.id); return item ? supabase?.storage.from(item.storage_bucket).getPublicUrl(item.storage_path).data.publicUrl : undefined; })() : undefined} onChange={(files) => setExhibitionFile(files[0] ?? null)} /><label className="admin-field">Tytuł<input required value={String(exhibitionForm.title)} onChange={(event) => setExhibitionForm({ ...exhibitionForm, title: event.target.value, slug: exhibitionForm.slug || slugify(event.target.value) })} /></label><label className="admin-field">Slug<input value={String(exhibitionForm.slug)} onChange={(event) => setExhibitionForm({ ...exhibitionForm, slug: event.target.value })} /></label><label className="admin-field">Miejsce<input value={String(exhibitionForm.venue)} onChange={(event) => setExhibitionForm({ ...exhibitionForm, venue: event.target.value })} /></label><div className="admin-field-grid"><label className="admin-field">Data od<input type="date" value={String(exhibitionForm.start_date)} onChange={(event) => setExhibitionForm({ ...exhibitionForm, start_date: event.target.value })} /></label><label className="admin-field">Data do<input type="date" value={String(exhibitionForm.end_date)} onChange={(event) => setExhibitionForm({ ...exhibitionForm, end_date: event.target.value })} /></label></div><label className="admin-field">Opis<textarea rows={4} value={String(exhibitionForm.description)} onChange={(event) => setExhibitionForm({ ...exhibitionForm, description: event.target.value })} /></label><label className="admin-field">Kolejność<input type="number" value={String(exhibitionForm.sort_order)} onChange={(event) => setExhibitionForm({ ...exhibitionForm, sort_order: event.target.value })} /></label><label className="admin-check"><input type="checkbox" checked={exhibitionForm.is_published === true} onChange={(event) => setExhibitionForm({ ...exhibitionForm, is_published: event.target.checked })} /> Opublikowana</label><div className="admin-form-actions"><button className="button" disabled={busy}>Zapisz wystawę</button>{editingExhibition && <button type="button" className="admin-button" onClick={() => { setEditingExhibition(null); setExhibitionForm(emptyExhibition); }}>Anuluj</button>}</div><p className="admin-help">Wystawy nie mają przypisanych dzieł.</p></form></div>}
  </section>;
}
