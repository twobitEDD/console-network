/**
 * Production bundle size budgets (gzip). Fails CI when artifacts grow unexpectedly.
 *
 * Requires `package/dist/*` from `npm run build:console` — `npm test` runs the build first.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Bump intentionally when shipping materially more UI / adapters. */
const BUDGETS = Object.freeze({
  "package/dist/console-network.es.js": 10_600,
  "package/dist/console-network.cjs.js": 8_800,
  "package/dist/style.css": 9_900,
});

function gzipSize(relPath) {
  const abs = join(repoRoot, relPath);
  assert.ok(existsSync(abs), `missing build artifact (run npm run build:console): ${relPath}`);
  return gzipSync(readFileSync(abs)).length;
}

describe("performance / bundle budgets", () => {
  for (const [relPath, maxGzipBytes] of Object.entries(BUDGETS)) {
    test(`${relPath} gzip ≤ ${maxGzipBytes} bytes`, () => {
      const n = gzipSize(relPath);
      assert.ok(
        n <= maxGzipBytes,
        `${relPath} gzip ${n} bytes exceeds budget ${maxGzipBytes} — bump BUDGETS if this growth is expected`,
      );
    });
  }
});
