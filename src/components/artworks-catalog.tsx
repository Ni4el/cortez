"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDownUp, SlidersHorizontal } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { useLocale } from "@/components/locale-provider";
import { availabilityLabels, getArtworkOrientation, getArtworkSizeCategory, sortArtworks, type Artwork, type ArtworkSort } from "@/lib/catalog";

const emptyFilters = { availability: "", year: "", method: "", priceMax: "", frame: "", size: "", sizeCategory: "", orientation: "" };
const sortOptions: { value: ArtworkSort; label: string }[] = [
  { value: "default", label: "sortDefault" },
  { value: "year-desc", label: "sortYearDesc" },
  { value: "year-asc", label: "sortYearAsc" },
  { value: "price-asc", label: "sortPriceAsc" },
  { value: "price-desc", label: "sortPriceDesc" },
  { value: "newest", label: "sortNewest" },
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
  const { t, currency } = useLocale();
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
      if (filters.priceMax && (artwork.price == null || artwork.price > Number(filters.priceMax))) return false;
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
        <h1 id="artworks-title">{t("works")}</h1>
        <div className="catalog-tools">
          <div className="search-input-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t("search")} aria-label={t("searchLabel")} className="search-input" />
            {searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="search-clear" aria-label={t("clearSearch")}>✕</button>}
          </div>
          <div className="catalog-filter" ref={filterRef}>
          <button ref={toggleRef} type="button" className="filter-toggle" onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen} aria-controls="artwork-filters" aria-label={activeFilterCount ? `${t("filterWorks")}, ${t("activeFilters")}: ${activeFilterCount}` : t("filterWorks")}>
            <SlidersHorizontal size={20} aria-hidden="true" />
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>
          {filterOpen && <div className="filter-popup" id="artwork-filters" role="region" aria-labelledby="filter-title">
            <h2 id="filter-title">{t("filterWorks")}</h2>
            <div className="filter-grid">
              <label className="filter-field">{t("saleStatus")}
                <select value={filters.availability} onChange={(event) => setFilters({ ...filters, availability: event.target.value })}>
                  <option value="">{t("all")}</option>
                  {Object.keys(availabilityLabels).map((value) => <option key={value} value={value}>{t(value)}</option>)}
                </select>
              </label>
              <label className="filter-field">{t("yearPainted")}
                <select value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })}>
                  <option value="">{t("all")}</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </label>
              <label className="filter-field">{t("technique")}
                <select value={filters.method} onChange={(event) => setFilters({ ...filters, method: event.target.value })}>
                  <option value="">{t("all")}</option>{methods.map((method) => <option key={method} value={method}>{t(method)}</option>)}
                </select>
              </label>
              <label className="filter-field">{t("priceMax")} ({currency})
                <input type="number" min="0" value={filters.priceMax} onChange={(event) => setFilters({ ...filters, priceMax: event.target.value })} placeholder="np. 5000" />
              </label>
              <label className="filter-field">{t("frame")}
                <select value={filters.frame} onChange={(event) => setFilters({ ...filters, frame: event.target.value })}>
                  <option value="">{t("all")}</option><option value="yes">{t("framed")}</option><option value="no">{t("unframed")}</option>
                </select>
              </label>
              <label className="filter-field">{t("orientation")}
                <select value={filters.orientation} onChange={(event) => setFilters({ ...filters, orientation: event.target.value })}>
                  <option value="">{t("all")}</option><option value="vertical">{t("vertical")}</option><option value="horizontal">{t("horizontal")}</option>
                </select>
              </label>
              <label className="filter-field">{t("sizeCategory")}
                <select value={filters.sizeCategory} onChange={(event) => setFilters({ ...filters, sizeCategory: event.target.value })}>
                  <option value="">{t("all")}</option><option value="small">{t("small")}</option><option value="medium">{t("medium")}</option><option value="large">{t("large")}</option>
                </select>
              </label>
              <label className="filter-field">{t("dimensions")}
                <select value={filters.size} onChange={(event) => setFilters({ ...filters, size: event.target.value })}>
                  <option value="">{t("all")}</option>{sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
            </div>
            <div className="filter-actions">
              <button type="button" className="button button-secondary" onClick={() => setFilters(emptyFilters)}>{t("clearFilters")}</button>
              <button type="button" className="button" onClick={() => { setFilterOpen(false); toggleRef.current?.focus(); }}>{t("close")}</button>
            </div>
          </div>}
          </div>
          <label className="catalog-sort">
            <ArrowDownUp className="catalog-sort-icon" size={17} aria-hidden="true" />
            <select aria-label={t("sort")} value={sort} onChange={(event) => setSort(event.target.value as ArtworkSort)}>
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
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
        <p>{t("noResults")}</p>
        <button type="button" className="button button-secondary" onClick={() => { setSearchQuery(""); setFilters(emptyFilters); }}>{t("clearSearchFilters")}</button>
      </div>}
    </>
  );
}
