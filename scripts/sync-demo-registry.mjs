#!/usr/bin/env node
/**
 * Copies registry/theme CSS into examples/demo/public/registry-themes/
 * and writes examples/demo/public/registry-index.json with css URLs pointing
 * at those static paths so `vite dev`, `vite preview`, and static hosts work.
 *
 * Run via npm scripts before demo dev/build, after updating registry/index.json.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(repoRoot, "registry/index.json");
const demoIndexOut = join(repoRoot, "examples/demo/public/registry-index.json");
const themesSrc = join(repoRoot, "registry/themes");
const themesPub = join(repoRoot, "examples/demo/public/registry-themes");

if (!existsSync(indexPath)) {
  console.error("Missing registry/index.json — run: npm run registry:build");
  process.exit(1);
}

for (const slug of readdirSync(themesSrc)) {
  if (slug.startsWith("_")) continue;
  const cssFrom = join(themesSrc, slug, "theme.css");
  if (!existsSync(cssFrom)) continue;
  mkdirSync(join(themesPub, slug), { recursive: true });
  cpSync(cssFrom, join(themesPub, slug, "theme.css"));
}

const idx = JSON.parse(readFileSync(indexPath, "utf8"));
const patched = {
  ...idx,
  themes: idx.themes.map((t) => ({
    ...t,
    css: `/registry-themes/${t.slug}/theme.css`,
  })),
};
writeFileSync(demoIndexOut, `${JSON.stringify(patched, null, 2)}\n`);
console.log(
  `Demo registry synced (${patched.themes.length} theme(s)) → examples/demo/public/`,
);
