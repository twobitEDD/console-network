#!/usr/bin/env node
/**
 * Print gzipped sizes for shipped artifacts (library JS + CSS).
 * Run after `npm run build:console` (or `npm test`).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  "package/dist/console-network.es.js",
  "package/dist/console-network.cjs.js",
  "package/dist/style.css",
];

let missing = false;
const rows = [];

for (const rel of FILES) {
  const abs = join(repoRoot, rel);
  if (!existsSync(abs)) {
    missing = true;
    rows.push({ file: rel, raw: "—", gzip: "(missing — run npm run build:console)" });
    continue;
  }
  const buf = readFileSync(abs);
  rows.push({
    file: rel,
    raw: buf.length,
    gzip: gzipSync(buf).length,
  });
}

console.table(rows);
if (missing) {
  process.exitCode = 1;
}
