import assert from "node:assert/strict";
import { test } from "node:test";
import { sortArtworks } from "../src/lib/catalog.ts";

const artworks = [
  { id: "a", year: "2020", price: 6500, createdAt: "2020-01-01T00:00:00Z" },
  { id: "missing", createdAt: "invalid" },
  { id: "b", year: "1999", price: 0, createdAt: "2023-06-01T00:00:00Z" },
  { id: "c", year: "2023", price: 10000, createdAt: "2022-01-01T00:00:00Z" },
];

test("sortowanie roku i ceny w obu kierunkach umieszcza brakujące dane na końcu", () => {
  const ids = (sort) => sortArtworks(artworks, sort).map((artwork) => artwork.id);
  assert.deepEqual(ids("year-asc"), ["b", "a", "c", "missing"]);
  assert.deepEqual(ids("year-desc"), ["c", "a", "b", "missing"]);
  assert.deepEqual(ids("price-asc"), ["b", "a", "c", "missing"]);
  assert.deepEqual(ids("price-desc"), ["c", "a", "b", "missing"]);
  assert.deepEqual(ids("default"), ["a", "missing", "b", "c"]);
  assert.deepEqual(artworks.map((artwork) => artwork.id), ["a", "missing", "b", "c"]);
});

test("ostatnio dodane wykorzystuje datę dodania, a nie rok dzieła", () => {
  assert.deepEqual(sortArtworks(artworks, "newest").map((artwork) => artwork.id), ["b", "c", "a", "missing"]);
});
