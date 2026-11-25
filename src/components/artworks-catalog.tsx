"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDownUp, SlidersHorizontal } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { availabilityLabels, getArtworkOrientation, getArtworkSizeCategory, sortArtworks, type Artwork, type ArtworkSort } from "@/lib/catalog";

const emptyFilters = { availability: "", year: "", method: "", priceMax: "", frame: "", size: "", sizeCategory: "", orientation: "" };
const sortOptions: { value: ArtworkSort; label: string }[] = [
  { value: "default", label: "Domyślnie" },
  { value: "year-desc", label: "Rok: od najnowszych" },
  { value: "year-asc", label: "Rok: od najstarszych" },
  { value: "price-asc", label: "Cena: od najniższej" },
  { value: "price-desc", label: "Cena: od najwyższej" },
  { value: "newest", label: "Ostatnio dodane" },
];

function normalizeText(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").trim();
}

function frameStatus(frame?: string) {
  const value = normalizeText(frame ?? "");
  if (!value) return "";
  return /^(nie|brak|bez|no|none)(\b|$)/.test(value) ? "no" : "yes";
}

function uniqueValues(values: (string | undefined)[]) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b, "pl", { numeric: true }));
}

export function ArtworksCatalog({ initialArtworks }: { initialArtworks: Artwork[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState<ArtworkSort>("default");
  const [restorationReady, setRestorationReady] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    try {
      const raw = sessionStorage.getItem("artwork_catalog_filters");
      if (raw) {
        sessionStorage.removeItem("artwork_catalog_filters");
        const saved = JSON.parse(raw);
        // Restore the list before painting or restoring its scroll position.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (typeof saved.searchQuery === "string") setSearchQuery(saved.searchQuery);
        if (sortOptions.some((option) => option.value === saved.sort)) setSort(saved.sort);
        if (saved.filters && typeof saved.filters === "object") {
          const restored = { ...emptyFilters };
          for (const key of Object.keys(restored) as (keyof typeof restored)[]) {
            if (typeof saved.filters[key] === "string") restored[key] = saved.filters[key];
          }
          setFilters(restored);
        }
      }
    } catch {}
    setRestorationReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!restorationReady) return;
    try {
      const raw = sessionStorage.getItem("artwork_scroll_restoration");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.url !== "string" || data.url.split(/[?#]/)[0] !== "/dziela") return;
      sessionStorage.removeItem("artwork_scroll_restoration");
      if (Date.now() - (data.timestamp || 0) <= 30 * 60 * 1000 && typeof data.scrollY === "number") {
        window.scrollTo({ top: data.scrollY, behavior: "instant" });
      }
    } catch {} finally {
      if ("scrollRestoration" in window.history) window.history.scrollRestoration = "auto";
    }
  }, [restorationReady]);

  useEffect(() => {
    if (!filterOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!filterRef.current?.contains(event.target as Node)) setFilterOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFilterOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterOpen]);

  const filteredArtworks = useMemo(() => {
    const query = normalizeText(searchQuery);
    const matching = initialArtworks.filter((artwork) => {
      if (query && !normalizeText(artwork.title ?? "").includes(query)) return false;
      if (filters.availability && artwork.availability !== filters.availability) return false;
      if (filters.year && artwork.year !== filters.year) return false;
      if (filters.method && artwork.method !== filters.method) return false;
      if (filters.priceMax && (artwork.pricePln == null || artwork.pricePln > Number(filters.priceMax))) return false;
      if (filters.frame && frameStatus(artwork.frame) !== filters.frame) return false;
      if (filters.size && artwork.size !== filters.size) return false;
      if (filters.sizeCategory && getArtworkSizeCategory(artwork.size) !== filters.sizeCategory) return false;
      if (filters.orientation && getArtworkOrientation(artwork.size) !== filters.orientation) return false;
      return true;
    });
    return sortArtworks(matching, sort);
  }, [initialArtworks, searchQuery, filters, sort]);

  const years = uniqueValues(initialArtworks.map((artwork) => artwork.year)).reverse();
  const methods = uniqueValues(initialArtworks.map((artwork) => artwork.method));
  const sizes = uniqueValues(initialArtworks.map((artwork) => artwork.size));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      <div className="catalog-header">
        <h1 id="artworks-title">Dzieła</h1>
        <div className="catalog-tools">
          <div className="search-input-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Szukaj dzieła po nazwie…" aria-label="Szukaj dzieła po nazwie" className="search-input" />
            {searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="search-clear" aria-label="Wyczyść wyszukiwanie">✕</button>}
          </div>
          <div className="catalog-filter" ref={filterRef}>
          <button ref={toggleRef} type="button" className="filter-toggle" onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen} aria-controls="artwork-filters" aria-label={activeFilterCount ? `Filtruj dzieła, aktywne filtry: ${activeFilterCount}` : "Filtruj dzieła"}>
            <SlidersHorizontal size={20} aria-hidden="true" />
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>
          {filterOpen && <div className="filter-popup" id="artwork-filters" role="region" aria-labelledby="filter-title">
            <h2 id="filter-title">Filtruj dzieła</h2>
            <div className="filter-grid">
              <label className="filter-field">Status sprzedaży
                <select value={filters.availability} onChange={(event) => setFilters({ ...filters, availability: event.target.value })}>
                  <option value="">Wszystkie</option>
                  {Object.entries(availabilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="filter-field">Rok namalowania
                <select value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })}>
                  <option value="">Wszystkie</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </label>
              <label className="filter-field">Technika
                <select value={filters.method} onChange={(event) => setFilters({ ...filters, method: event.target.value })}>
                  <option value="">Wszystkie</option>{methods.map((method) => <option key={method} value={method}>{method}</option>)}
                </select>
              </label>
              <label className="filter-field">Cena do (PLN)
                <input type="number" min="0" value={filters.priceMax} onChange={(event) => setFilters({ ...filters, priceMax: event.target.value })} placeholder="np. 5000" />
              </label>
              <label className="filter-field">Rama
                <select value={filters.frame} onChange={(event) => setFilters({ ...filters, frame: event.target.value })}>
                  <option value="">Wszystkie</option><option value="yes">Z ramą</option><option value="no">Bez ramy</option>
                </select>
              </label>
              <label className="filter-field">Orientacja
                <select value={filters.orientation} onChange={(event) => setFilters({ ...filters, orientation: event.target.value })}>
                  <option value="">Wszystkie</option><option value="vertical">Pionowa</option><option value="horizontal">Pozioma</option>
                </select>
              </label>
              <label className="filter-field">Wielkość
                <select value={filters.sizeCategory} onChange={(event) => setFilters({ ...filters, sizeCategory: event.target.value })}>
                  <option value="">Wszystkie</option><option value="small">Małe ( &lt;40cm )</option><option value="medium">Średnie ( 40cm-89cm )</option><option value="large">Duże ( &gt;90cm )</option>
                </select>
              </label>
              <label className="filter-field">Rozmiar
                <select value={filters.size} onChange={(event) => setFilters({ ...filters, size: event.target.value })}>
                  <option value="">Wszystkie</option>{sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
            </div>
            <div className="filter-actions">
              <button type="button" className="button button-secondary" onClick={() => setFilters(emptyFilters)}>Wyczyść filtry</button>
              <button type="button" className="button" onClick={() => { setFilterOpen(false); toggleRef.current?.focus(); }}>Zamknij</button>
            </div>
          </div>}
          </div>
          <label className="catalog-sort">
            <ArrowDownUp className="catalog-sort-icon" size={17} aria-hidden="true" />
            <select aria-label="Sortuj według" value={sort} onChange={(event) => setSort(event.target.value as ArtworkSort)}>
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </div>
      {filteredArtworks.length > 0 ? <div className="artwork-grid" onClickCapture={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = (event.target as Element).closest("a");
        if (!link || !/^\/dziela\/[^/]+\/?$/.test(link.pathname)) return;
        try {
          sessionStorage.setItem("artwork_catalog_filters", JSON.stringify({ searchQuery, filters, sort }));
          if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
        } catch {}
      }}>
        {filteredArtworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}
      </div> : <div className="catalog-empty-search" role="status">
        <p>Nie znaleziono dzieł pasujących do wyszukiwania i wybranych filtrów.</p>
        <button type="button" className="button button-secondary" onClick={() => { setSearchQuery(""); setFilters(emptyFilters); }}>Wyczyść wyszukiwanie i filtry</button>
      </div>}
    </>
  );
}
