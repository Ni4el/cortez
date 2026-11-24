"use client";

import { useMemo, useState } from "react";
import { ArtworkCard } from "@/components/artwork-card";
import type { Artwork } from "@/lib/catalog";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function ArtworksCatalog({ initialArtworks }: { initialArtworks: Artwork[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArtworks = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return initialArtworks;

    const normalizedQuery = normalizeText(query);
    return initialArtworks.filter((artwork) => {
      const title = artwork.title || "";
      return (
        title.toLowerCase().includes(query.toLowerCase()) ||
        normalizeText(title).includes(normalizedQuery)
      );
    });
  }, [initialArtworks, searchQuery]);

  return (
    <>
      <div className="catalog-header">
        <div>
          <p className="eyebrow">Katalog</p>
          <h1 id="artworks-title">Dzieła</h1>
        </div>
        <div className="catalog-search">
          <div className="search-input-wrap">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj dzieła po nazwie…"
              aria-label="Szukaj dzieła po nazwie"
              className="search-input"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="search-clear"
                aria-label="Wyczyść wyszukiwanie"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {filteredArtworks.length > 0 ? (
        <div className="artwork-grid">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="catalog-empty-search">
          <p>
            Nie znaleziono dzieł pasujących do zapytania:{" "}
            <strong>„{searchQuery}”</strong>
          </p>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setSearchQuery("")}
          >
            Wyczyść wyszukiwanie
          </button>
        </div>
      )}
    </>
  );
}
