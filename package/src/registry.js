/**
 * Runtime helpers for consuming the Console Network registry.
 *
 * The registry is just `registry/index.json` in the root repo, regenerated
 * by `scripts/build-registry.mjs` on every merge. Consumers fetch it at
 * runtime so that adding a new theme/project does not require a new npm
 * release of this package.
 */

/** Default public registry. Override with `registryUrl` in component props. */
export const DEFAULT_REGISTRY_URL =
  "https://raw.githubusercontent.com/twobitEDD/console-network/main/registry/index.json";

/**
 * Fetch and normalize the registry. Throws on transport or parse errors so
 * the caller can decide how to present failures.
 *
 * @param {object} [opts]
 * @param {string} [opts.url]
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<{generatedAt:string, version:number, themes:Array, projects:Array}>}
 */
export async function fetchRegistry({ url = DEFAULT_REGISTRY_URL, signal } = {}) {
  const res = await fetch(url, { signal, headers: { accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`[console-network] registry fetch failed: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data || typeof data !== "object" || !Array.isArray(data.projects) || !Array.isArray(data.themes)) {
    throw new Error("[console-network] registry response is not a valid index.json");
  }
  return data;
}

/**
 * Case-insensitive substring match across the fields a human would skim.
 * Used by ConnectionsPanel to filter the project grid.
 */
export function matchProject(project, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    project.name,
    project.owner,
    project.description,
    project.longDescription,
    (project.tags || []).join(" "),
    project.category,
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
  return haystack.includes(q);
}

/** Collect every unique tag across a list, sorted alphabetically. */
export function collectTags(entries) {
  const set = new Set();
  for (const e of entries || []) {
    for (const t of e.tags || []) set.add(t);
  }
  return [...set].sort();
}
