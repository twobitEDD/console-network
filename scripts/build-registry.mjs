#!/usr/bin/env node
/**
 * Build registry/index.json from every manifest under registry/.
 *
 *   node scripts/build-registry.mjs            writes registry/index.json
 *   node scripts/build-registry.mjs --check    exits non-zero if the file
 *                                              on disk doesn't match what
 *                                              would be generated (for CI)
 *
 * Freezing generatedAt to EPOCH_GENERATED keeps diffs stable for --check;
 * the write mode uses the current timestamp.
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { buildIndex } from "./registry-lib.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = resolve(repoRoot, "registry", "index.json");
const args = new Set(process.argv.slice(2));
const checkMode = args.has("--check");

const generatedAt = checkMode ? "FROZEN-FOR-DIFF" : new Date().toISOString();
const { errors, index } = await buildIndex(repoRoot, { generatedAt });

if (errors.length > 0) {
  console.error(`\n✗ Registry validation failed (${errors.length} error${errors.length === 1 ? "" : "s"}):\n`);
  for (const err of errors) console.error(`  • ${err}`);
  process.exit(1);
}

const serialized = JSON.stringify(index, null, 2) + "\n";

if (checkMode) {
  let existing = "";
  try {
    existing = await readFile(outPath, "utf8");
  } catch {
    console.error("✗ registry/index.json is missing. Run: node scripts/build-registry.mjs");
    process.exit(1);
  }
  const normalize = (s) => s.replace(/"generatedAt":\s*"[^"]*"/, '"generatedAt": "FROZEN-FOR-DIFF"');
  if (normalize(existing) !== serialized) {
    console.error("✗ registry/index.json is out of date. Rebuild with: node scripts/build-registry.mjs");
    process.exit(1);
  }
  console.log("✓ registry/index.json is up to date.");
  process.exit(0);
}

await writeFile(outPath, serialized);
console.log(`✓ Wrote ${index.themes.length} theme(s) + ${index.projects.length} project(s) to registry/index.json`);
