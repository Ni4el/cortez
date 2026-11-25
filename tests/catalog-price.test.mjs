import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPricePln } from "../src/lib/catalog.ts";

test("cena ma grupy tysięcy i dwa miejsca po przecinku", () => {
  assert.equal(formatPricePln(6500), "6\u00a0500,00\u00a0zł");
  assert.equal(formatPricePln(1000), "1\u00a0000,00\u00a0zł");
  assert.equal(formatPricePln(1250000.5), "1\u00a0250\u00a0000,50\u00a0zł");
  assert.equal(formatPricePln(123.45), "123,45\u00a0zł");
});
