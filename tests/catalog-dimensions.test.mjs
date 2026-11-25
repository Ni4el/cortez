import assert from "node:assert/strict";
import { test } from "node:test";
import { getArtworkOrientation, getArtworkSizeCategory } from "../src/lib/catalog.ts";

test("wielkość zależy od dłuższego boku i uwzględnia wartości graniczne", () => {
  for (const [dimensions, expected] of [
    ["39 x 25 cm", "small"],
    ["39,9 x 25 cm", "small"],
    ["40 x 40 cm", "medium"],
    ["40,1 x 25 cm", "medium"],
    ["89,9 x 25 cm", "medium"],
    ["90 x 25 cm", "large"],
    ["25 x 120 cm", "large"],
    ["brak", undefined],
    ["0 x 20 cm", undefined],
  ]) assert.equal(getArtworkSizeCategory(dimensions), expected, dimensions);
});

test("orientacja uwzględnia kolejność wymiarów i liczby dziesiętne", () => {
  for (const [dimensions, expected] of [
    ["60 x 20 cm", "vertical"],
    ["30 x 40 cm", "horizontal"],
    ["28 x 27,8 cm", "vertical"],
    ["27,8 x 28 cm", "horizontal"],
    ["40 x 40 cm", undefined],
    ["brak", undefined],
  ]) assert.equal(getArtworkOrientation(dimensions), expected, dimensions);
});
