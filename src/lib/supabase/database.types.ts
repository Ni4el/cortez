export type Database = {
  public: {
    Tables: {
      authors: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["authors"]["Row"]> & { slug: string; name: string };
        Update: Partial<Database["public"]["Tables"]["authors"]["Row"]>;
        Relationships: [];
      };
      artworks: {
        Row: {
          id: string;
          slug: string;
          image_id: string | null;
          availability: "available" | "reserved" | "sold" | "gifted" | "not_for_sale";
          title: string | null;
          description: string | null;
          year: string | null;
          method: "Olej na płycie" | "Olej na płótnie" | "Ołówek na papierze" | null;
          size: string | null;
          place: string | null;
          author: string | null;
          price_pln: number | null;
          publication_status: "draft" | "published" | "hidden";
          frame: string | null;
          sale_mode: "direct" | "inquiry" | "none";
          is_main: boolean;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["artworks"]["Row"]> & { slug: string };
        Update: Partial<Database["public"]["Tables"]["artworks"]["Row"]>;
        Relationships: [];
      };
      rooms: {
        Row: { id: string; slug: string; label: string | null; parent_room_id: string | null; is_primary: boolean; is_published: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["rooms"]["Row"]> & { slug: string };
        Update: Partial<Database["public"]["Tables"]["rooms"]["Row"]>;
        Relationships: [];
      };
      media_assets: {
        Row: { id: string; storage_bucket: string; storage_path: string; role: "thumbnail" | "wall_view" | "high_resolution" | "room_image"; mime_type: string; width: number | null; height: number | null; byte_size: number | null; alt_text: string | null; is_public: boolean; artwork_id: string | null; room_id: string | null; exhibition_id: string | null; sort_order: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["media_assets"]["Row"]> & { storage_bucket: string; storage_path: string; role: Database["public"]["Tables"]["media_assets"]["Row"]["role"]; mime_type: string };
        Update: Partial<Database["public"]["Tables"]["media_assets"]["Row"]>;
        Relationships: [];
      };
      room_hotspots: {
        Row: { id: string; room_id: string; kind: "artwork" | "room"; x: number; y: number; width: number; height: number; accessible_label: string; artwork_id: string | null; target_room_id: string | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["room_hotspots"]["Row"]> & { room_id: string; kind: "artwork" | "room"; x: number; y: number; width: number; height: number; accessible_label: string };
        Update: Partial<Database["public"]["Tables"]["room_hotspots"]["Row"]>;
        Relationships: [];
      };
      room_artworks: {
        Row: { artwork_id: string; room_id: string; sort_order: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["room_artworks"]["Row"]> & { artwork_id: string; room_id: string };
        Update: Partial<Database["public"]["Tables"]["room_artworks"]["Row"]>;
        Relationships: [];
      };
      exhibitions: {
        Row: { id: string; slug: string; title: string; venue: string | null; start_date: string | null; end_date: string | null; description: string | null; is_published: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["exhibitions"]["Row"]> & { slug: string; title: string };
        Update: Partial<Database["public"]["Tables"]["exhibitions"]["Row"]>;
        Relationships: [];
      };
      tags: {
        Row: { id: string; name: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["tags"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["tags"]["Row"]>;
        Relationships: [];
      };
      artwork_tags: {
        Row: { artwork_id: string; tag_id: string; created_at: string };
        Insert: { artwork_id: string; tag_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["artwork_tags"]["Row"]>;
        Relationships: [];
      };
      admin_users: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      enum_availability: "available" | "reserved" | "sold" | "gifted" | "not_for_sale";
      enum_method: "Olej na płycie" | "Olej na płótnie" | "Ołówek na papierze";
      enum_status: "draft" | "published" | "hidden";
      sale_mode: "direct" | "inquiry" | "none";
      media_role: "thumbnail" | "wall_view" | "high_resolution" | "room_image";
      hotspot_type: "artwork" | "room";
    };
    CompositeTypes: Record<string, never>;
  };
};
