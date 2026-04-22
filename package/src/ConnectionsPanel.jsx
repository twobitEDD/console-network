/**
 * ConnectionsPanel — full-rig modal that lists every project in the public
 * Console Network registry. Built-in feature of the framework; any host can
 * drop it in to surface sibling projects.
 *
 * Usage:
 *
 *   const [open, setOpen] = useState(false);
 *   …
 *   <button onClick={() => setOpen(true)}>Connections</button>
 *   <ConnectionsPanel
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     currentProjectId="super-tic-tac-toe"
 *   />
 *
 * The panel fetches registry/index.json on first open and caches it for the
 * lifetime of the component. No dependency on any network other than the
 * default raw.github.com URL, which can be overridden via `registryUrl`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_REGISTRY_URL,
  collectTags,
  fetchRegistry,
  matchProject,
} from "./registry.js";

export default function ConnectionsPanel({
  open = false,
  onClose,
  registryUrl = DEFAULT_REGISTRY_URL,
  currentProjectId = null,
  labels: overrides = {},
}) {
  const labels = { ...DEFAULT_LABELS, ...overrides };

  const [data, setData]         = useState(null);
  const [error, setError]       = useState(null);
  const [query, setQuery]       = useState("");
  const [activeTag, setTag]     = useState(null);
  const [trackedUrl, setTrackedUrl] = useState(registryUrl);
  const dialogRef               = useRef(null);

  /* If the URL changed, drop the cached result during render. React docs pattern. */
  if (trackedUrl !== registryUrl) {
    setTrackedUrl(registryUrl);
    setData(null);
    setError(null);
  }

  const hasLoaded               = data !== null || error !== null;
  const isLoading               = open && !hasLoaded;

  /* Lazy-load the registry the first time the panel opens for this URL. */
  useEffect(() => {
    if (!open || hasLoaded) return undefined;
    const controller = new AbortController();
    fetchRegistry({ url: registryUrl, signal: controller.signal })
      .then(setData)
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(err);
      });
    return () => controller.abort();
  }, [open, registryUrl, hasLoaded]);

  /* Close on Escape. */
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const projects = useMemo(() => data?.projects ?? [], [data]);
  const tags     = useMemo(() => collectTags(projects), [projects]);

  const filtered = useMemo(() => {
    return projects
      .filter((p) => p.status !== "hidden")
      .filter((p) => (activeTag ? (p.tags || []).includes(activeTag) : true))
      .filter((p) => matchProject(p, query));
  }, [projects, activeTag, query]);

  const onBackdropClick = useCallback((event) => {
    if (event.target === dialogRef.current) onClose?.();
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      className="holo-connections"
      role="dialog"
      aria-modal="true"
      aria-label={labels.title}
      onClick={onBackdropClick}
    >
      <div className="holo-connections__shell">
        <header className="holo-connections__header">
          <div>
            <p className="holo-connections__eyebrow">{labels.eyebrow}</p>
            <h2 className="holo-connections__title">{labels.title}</h2>
          </div>
          <button
            type="button"
            className="holo-connections__close"
            onClick={onClose}
            aria-label={labels.close}
          >
            ×
          </button>
        </header>

        <div className="holo-connections__controls">
          <label className="holo-connections__search">
            <span className="sr-only">{labels.searchPlaceholder}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              autoFocus
            />
          </label>
          {tags.length > 0 && (
            <div className="holo-connections__tags" role="tablist" aria-label={labels.tagsLabel}>
              <button
                type="button"
                className={`holo-connections__tag ${activeTag === null ? "is-active" : ""}`}
                onClick={() => setTag(null)}
              >
                {labels.allTag}
              </button>
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`holo-connections__tag ${activeTag === tag ? "is-active" : ""}`}
                  onClick={() => setTag(tag === activeTag ? null : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="holo-connections__body">
          {isLoading && <p className="holo-connections__status">{labels.loading}</p>}
          {error && (
            <div className="holo-connections__status holo-connections__status--error">
              <p>{labels.error}</p>
              <p className="holo-connections__status-detail">{error?.message}</p>
            </div>
          )}
          {data && filtered.length === 0 && (
            <p className="holo-connections__status">{labels.empty}</p>
          )}

          {data && filtered.length > 0 && (
            <ul className="holo-connections__grid">
              {filtered.map((project) => (
                <li
                  key={project.id}
                  className={`holo-connections__card ${project.id === currentProjectId ? "is-current" : ""}`}
                >
                  {project.cover
                    ? <div className="holo-connections__cover" style={{ backgroundImage: `url(${project.cover})` }} aria-hidden="true" />
                    : <div className="holo-connections__cover holo-connections__cover--placeholder" aria-hidden="true">{initials(project.name)}</div>}

                  <div className="holo-connections__card-body">
                    <div className="holo-connections__card-head">
                      <h3>{project.name}</h3>
                      {project.id === currentProjectId && (
                        <span className="holo-connections__badge">{labels.currentBadge}</span>
                      )}
                    </div>
                    <p className="holo-connections__owner">{project.owner}</p>
                    <p className="holo-connections__description">{project.description}</p>

                    {(project.tags?.length || project.chainIds?.length) ? (
                      <ul className="holo-connections__chips">
                        {project.tags?.slice(0, 4).map((tag) => (
                          <li key={`t-${tag}`} className="holo-connections__chip">{tag}</li>
                        ))}
                        {project.chainIds?.slice(0, 3).map((chain) => (
                          <li key={`c-${chain}`} className="holo-connections__chip holo-connections__chip--chain">chain:{chain}</li>
                        ))}
                        {project.requiresWallet && (
                          <li className="holo-connections__chip holo-connections__chip--wallet">{labels.walletChip}</li>
                        )}
                        {project.usesConsoleNetwork === false && (
                          <li className="holo-connections__chip holo-connections__chip--adjacent">{labels.adjacentChip}</li>
                        )}
                      </ul>
                    ) : null}

                    <div className="holo-connections__card-actions">
                      <a
                        className="holo-connections__open"
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {labels.openProject} ↗
                      </a>
                      {project.repo && (
                        <a
                          className="holo-connections__repo"
                          href={project.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {labels.repo}
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="holo-connections__footer">
          <span>{labels.footer}</span>
          <a
            href="https://github.com/twobitEDD/console-network/blob/main/.github/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            {labels.submit} →
          </a>
        </footer>
      </div>
    </div>
  );
}

const DEFAULT_LABELS = {
  eyebrow: "CONSOLE NETWORK",
  title: "Connections",
  close: "Close",
  searchPlaceholder: "Search projects…",
  tagsLabel: "Filter by tag",
  allTag: "all",
  loading: "Loading registry…",
  error: "Couldn't reach the registry.",
  empty: "No matches. Try clearing the filter.",
  openProject: "Open project",
  repo: "Repo",
  currentBadge: "you are here",
  walletChip: "wallet",
  adjacentChip: "adjacent",
  footer: "Your project could be listed here.",
  submit: "Submit yours",
};

function initials(name) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}
