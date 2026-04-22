# Console Network · Public Registry

This folder is the **canonical, file-based registry** for the Console Network. Two things are registered here:

- **Themes** — reusable visual skins for the console rig (`registry/themes/<slug>/`)
- **Projects** — apps, games, and tools that run inside a console rig (`registry/projects/<slug>/`)

Everything in here is public, versioned with git, and governed by PRs. Anyone can contribute. There is no central server, no signup, and no gatekeeper beyond code review. A GitHub Action validates every PR against a JSON Schema; once it goes green and a maintainer merges, a generated `registry/index.json` is published and picked up at runtime by every site running `@twobitedd/console-network` — usually within seconds of the CDN refreshing.

## What does "registered" get you?

- Your theme is automatically available to every site that opts into the built-in theme picker.
- Your project appears in every console's **Connections** panel (full-screen modal, searchable) — other consoles see you, you see them.
- Your repo, homepage, and chain/wallet requirements are discoverable without anyone running your code.

It is explicitly **not**:

- A hosting platform. We don't run your code; we link to it.
- A wallet. We surface `chainIds` as metadata only.
- An audit. Inclusion in the registry ≠ endorsement; review the project's own repo before connecting a wallet.

## Quickstart

### I want to add a theme

1. Copy `registry/themes/_template/` → `registry/themes/<your-theme-slug>/`
2. Edit `theme.json` (schema: [`_schema/theme.schema.json`](./_schema/theme.schema.json))
3. Drop your CSS into `theme.css`. Keep it under 8 kB and only override `--holo-*` custom properties.
4. Add a 960×600 PNG `preview.png`.
5. Open a PR using the **Theme** template.

### I want to register a project

1. Copy `registry/projects/_template/` → `registry/projects/<your-project-slug>/`
2. Edit `project.json` (schema: [`_schema/project.schema.json`](./_schema/project.schema.json))
3. Add a 1200×630 PNG `cover.png` and an optional `icon.png` (256×256).
4. Open a PR using the **Project** template.

Non-PR path: open an [issue using the Theme Submission or Project Submission form](../../issues/new/choose) and a maintainer will make the PR for you.

## How CI validates a PR

The [`registry.yml`](../.github/workflows/registry.yml) GitHub Action runs on every PR that touches `registry/**` or the generator scripts. It:

1. Runs `node scripts/validate-registry.mjs` which
   - loads every `theme.json` / `project.json`
   - checks each against its schema (required fields, types, enums, URL shapes)
   - rejects duplicate slugs, duplicate `id`s, and slug ≠ folder-name
   - asserts images exist at the declared paths
2. Runs `node scripts/build-registry.mjs --check` which rebuilds `registry/index.json` in-memory and diffs against the committed file to ensure the PR regenerated it.
3. Fails the PR with human-readable errors if anything is off.

Reviewers focus on **taste, accuracy, and good-faith use**, not shape correctness.

## Index schema

`registry/index.json` (generated) has this shape:

```json
{
  "generatedAt": "2026-04-20T12:00:00.000Z",
  "version": 1,
  "themes":   [ { "id": "...", "slug": "...", "name": "...", "author": "...", "preview": "…", "homepage": "…", "tags": [], "css": "<url>" } ],
  "projects": [ { "id": "...", "slug": "...", "name": "...", "owner": "...", "url": "…", "repo": "…", "chainIds": [], "tags": [], "cover": "…", "icon": "…", "description": "…" } ]
}
```

The `css`, `cover`, `icon`, and `preview` fields are absolute URLs to the files on the default branch (`https://raw.githubusercontent.com/twobitEDD/console-network/main/registry/...`). Consumers fetch `index.json` once, then lazy-load individual assets on demand.

## Moderation & removal

- **Illegal or malicious projects** are removed on sight.
- **Broken links** (404 on `homepage`, repo deleted) are flagged by a nightly check (coming soon) and given 30 days before removal.
- **Disputes** are handled via GitHub issues. The project's entry will be temporarily hidden by marking `status: "hidden"` in its manifest while a dispute is active.

## License

All theme CSS files are assumed licensed MIT unless the theme's own `license` field says otherwise. Project manifests link to projects whose licenses vary — check each project.

The registry structure itself (schemas, build scripts, index format) is MIT.
