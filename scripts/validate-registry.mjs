#!/usr/bin/env node
/**
 * Validate every manifest in registry/ against its schema + structural rules.
 * Exits non-zero with a human-readable report on any failure.
 *
 * Used by the GitHub Action on every PR. Also safe to run locally:
 *   node scripts/validate-registry.mjs
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { buildIndex } from "./registry-lib.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const { errors, index } = await buildIndex(repoRoot, { generatedAt: "0000-00-00T00:00:00.000Z" });

if (errors.length > 0) {
  console.error(`\n✗ Registry validation failed (${errors.length} error${errors.length === 1 ? "" : "s"}):\n`);
  for (const err of errors) console.error(`  • ${err}`);
  console.error("");
  process.exit(1);
}

console.log(`✓ Registry OK — ${index.themes.length} theme(s), ${index.projects.length} project(s).`);
