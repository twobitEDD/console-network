/**
 * Registry shared helpers.
 *
 * A tiny, dependency-free library used by both validate-registry.mjs and
 * build-registry.mjs. Exposes:
 *   - loadSchema / loadManifest
 *   - validate(data, schema)       — subset of JSON Schema draft-07 sufficient for our schemas
 *   - discoverEntries(kind)        — walk registry/<kind>/ for folders with manifests
 *   - buildIndex(repoRoot, opts)   — produce the generated index.json shape
 *
 * Keep this file to Node built-ins only (fs, path, url). CI should be able to
 * run it with nothing installed beyond Node 20+.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

/** The default CDN base used by generated URLs. Can be overridden per-call. */
export const DEFAULT_RAW_BASE =
  "https://raw.githubusercontent.com/twobitEDD/console-network/main";

export const INDEX_VERSION = 1;

/* ------------------------------------------------------------------ */
/* schema loading                                                     */
/* ------------------------------------------------------------------ */

export async function loadSchema(repoRoot, kind) {
  const p = join(repoRoot, "registry", "_schema", `${kind}.schema.json`);
  return JSON.parse(await readFile(p, "utf8"));
}

export async function loadManifest(filePath) {
  const raw = await readFile(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${filePath}: invalid JSON — ${err.message}`);
  }
}

/* ------------------------------------------------------------------ */
/* mini JSON-Schema validator                                         */
/* ------------------------------------------------------------------ */

/**
 * Validate `data` against `schema` and push any error messages onto `errors`.
 * Supports the subset of draft-07 we actually use: type, required, properties,
 * additionalProperties, pattern, minLength, maxLength, enum, format(uri), array
 * items + maxItems, and integer/string union.
 */
export function validate(data, schema, errors = [], path = "$") {
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeMatches(data, t))) {
      errors.push(`${path}: expected ${types.join("|")}, got ${kindOf(data)}`);
      return errors;
    }
  }

  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`${path}: must be one of ${JSON.stringify(schema.enum)}, got ${JSON.stringify(data)}`);
  }

  if (typeof data === "string") {
    if (typeof schema.minLength === "number" && data.length < schema.minLength) {
      errors.push(`${path}: must be at least ${schema.minLength} chars, got ${data.length}`);
    }
    if (typeof schema.maxLength === "number" && data.length > schema.maxLength) {
      errors.push(`${path}: must be at most ${schema.maxLength} chars, got ${data.length}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      errors.push(`${path}: does not match ${schema.pattern}`);
    }
    if (schema.format === "uri" && !isUri(data)) {
      errors.push(`${path}: not a valid absolute URL`);
    }
  }

  if (typeof data === "number") {
    if (typeof schema.minimum === "number" && data < schema.minimum) errors.push(`${path}: must be >= ${schema.minimum}`);
    if (typeof schema.maximum === "number" && data > schema.maximum) errors.push(`${path}: must be <= ${schema.maximum}`);
  }

  if (Array.isArray(data)) {
    if (typeof schema.maxItems === "number" && data.length > schema.maxItems) {
      errors.push(`${path}: may contain at most ${schema.maxItems} items, got ${data.length}`);
    }
    if (schema.items) {
      data.forEach((item, i) => validate(item, schema.items, errors, `${path}[${i}]`));
    }
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const required = schema.required ?? [];
    for (const key of required) {
      if (!(key in data)) errors.push(`${path}.${key}: required`);
    }

    if (schema.properties) {
      for (const [key, subSchema] of Object.entries(schema.properties)) {
        if (key in data) validate(data[key], subSchema, errors, `${path}.${key}`);
      }
    }

    if (schema.additionalProperties === false) {
      const known = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(data)) {
        if (!known.has(key)) errors.push(`${path}.${key}: unknown property`);
      }
    }
  }

  return errors;
}

function typeMatches(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "null") return value === null;
  if (type === "integer") return Number.isInteger(value);
  return typeof value === type && !(type === "object" && Array.isArray(value));
}

function kindOf(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function isUri(value) {
  try {
    const u = new URL(value);
    return Boolean(u.protocol && u.host);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* filesystem discovery                                               */
/* ------------------------------------------------------------------ */

const MANIFEST_NAME = { themes: "theme.json", projects: "project.json" };

/**
 * Scan registry/<kind>/ for folders containing the expected manifest file.
 * Skips folders starting with "_" (reserved for templates + schemas).
 * Returns [{ slug, dir, manifestPath, assetFiles:Set<string> }]
 */
export async function discoverEntries(repoRoot, kind) {
  const base = join(repoRoot, "registry", kind);
  let dirents;
  try {
    dirents = await readdir(base, { withFileTypes: true });
  } catch {
    return [];
  }
  const entries = [];
  for (const d of dirents) {
    if (!d.isDirectory() || d.name.startsWith("_") || d.name.startsWith(".")) continue;
    const dir = join(base, d.name);
    const manifestPath = join(dir, MANIFEST_NAME[kind]);
    try {
      await stat(manifestPath);
    } catch {
      continue;
    }
    const assetFiles = new Set((await readdir(dir)).filter((f) => f !== MANIFEST_NAME[kind]));
    entries.push({ slug: d.name, dir, manifestPath, assetFiles });
  }
  return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

/* ------------------------------------------------------------------ */
/* validation convenience                                             */
/* ------------------------------------------------------------------ */

/** Validate one manifest + its declared asset files; return an array of errors. */
export async function validateEntry({ kind, schema, entry }) {
  const errors = [];
  const manifest = await loadManifest(entry.manifestPath);

  validate(manifest, schema, errors, `registry/${kind}/${entry.slug}/${kind === "themes" ? "theme.json" : "project.json"}`);

  if (manifest.id && manifest.id !== entry.slug) {
    errors.push(`registry/${kind}/${entry.slug}: folder name must equal "id" (got id=${manifest.id})`);
  }
  if (manifest.slug && manifest.slug !== entry.slug) {
    errors.push(`registry/${kind}/${entry.slug}: folder name must equal "slug" (got slug=${manifest.slug})`);
  }

  if (manifest.files) {
    for (const [, rel] of Object.entries(manifest.files)) {
      if (!rel) continue;
      if (!entry.assetFiles.has(rel)) {
        errors.push(`registry/${kind}/${entry.slug}/${rel}: declared in manifest but file does not exist`);
      }
    }
  }

  return { manifest, errors };
}

/* ------------------------------------------------------------------ */
/* index builder                                                      */
/* ------------------------------------------------------------------ */

export async function buildIndex(repoRoot, { rawBase = DEFAULT_RAW_BASE, generatedAt } = {}) {
  const [themeSchema, projectSchema] = await Promise.all([
    loadSchema(repoRoot, "theme"),
    loadSchema(repoRoot, "project"),
  ]);

  const [themeEntries, projectEntries] = await Promise.all([
    discoverEntries(repoRoot, "themes"),
    discoverEntries(repoRoot, "projects"),
  ]);

  const allErrors = [];
  const themes = [];
  const projects = [];

  for (const entry of themeEntries) {
    const { manifest, errors } = await validateEntry({ kind: "themes", schema: themeSchema, entry });
    allErrors.push(...errors);
    if (!errors.length) {
      themes.push({
        id: manifest.id,
        slug: manifest.slug,
        name: manifest.name,
        author: manifest.author,
        authorUrl: manifest.authorUrl ?? null,
        version: manifest.version,
        license: manifest.license,
        description: manifest.description ?? null,
        tags: manifest.tags ?? [],
        homepage: manifest.homepage ?? null,
        repo: manifest.repo ?? null,
        status: manifest.status ?? "active",
        css: absoluteAsset(rawBase, "themes", manifest.slug, manifest.files?.css),
        preview: absoluteAsset(rawBase, "themes", manifest.slug, manifest.files?.preview),
      });
    }
  }

  for (const entry of projectEntries) {
    const { manifest, errors } = await validateEntry({ kind: "projects", schema: projectSchema, entry });
    allErrors.push(...errors);
    if (!errors.length) {
      projects.push({
        id: manifest.id,
        slug: manifest.slug,
        name: manifest.name,
        owner: manifest.owner,
        ownerUrl: manifest.ownerUrl ?? null,
        url: manifest.url,
        repo: manifest.repo ?? null,
        license: manifest.license,
        description: manifest.description,
        longDescription: manifest.longDescription ?? null,
        tags: manifest.tags ?? [],
        chainIds: manifest.chainIds ?? [],
        category: manifest.category ?? null,
        requiresWallet: Boolean(manifest.requiresWallet),
        usesConsoleNetwork: manifest.usesConsoleNetwork !== false,
        social: manifest.social ?? null,
        status: manifest.status ?? "active",
        cover: absoluteAsset(rawBase, "projects", manifest.slug, manifest.files?.cover),
        icon: absoluteAsset(rawBase, "projects", manifest.slug, manifest.files?.icon),
      });
    }
  }

  assertUniqueIds(themes, "theme", allErrors);
  assertUniqueIds(projects, "project", allErrors);

  return {
    errors: allErrors,
    index: {
      generatedAt: generatedAt ?? new Date().toISOString(),
      version: INDEX_VERSION,
      themes,
      projects,
    },
  };
}

function absoluteAsset(rawBase, kind, slug, filename) {
  if (!filename) return null;
  return `${rawBase}/registry/${kind}/${slug}/${filename}`;
}

function assertUniqueIds(list, label, errors) {
  const seen = new Map();
  for (const entry of list) {
    if (seen.has(entry.id)) errors.push(`${label}: duplicate id "${entry.id}" (also at ${seen.get(entry.id).slug})`);
    else seen.set(entry.id, entry);
  }
}

export { relative };
