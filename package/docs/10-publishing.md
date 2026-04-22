# Publishing a theme or project

A 5-minute path from idea to merged. Both paths run the same CI checks; both end with an entry in `registry/index.json` and instant discoverability via the **Connections** panel.

## Publish a theme

1. **Fork** the [`console-network`](https://github.com/twobitEDD/console-network) repo.
2. **Copy the template:**
   ```bash
   cp -R registry/themes/_template registry/themes/my-theme
   cd registry/themes/my-theme
   ```
3. **Edit `theme.json`:**
   ```json
   {
     "id": "my-theme",
     "slug": "my-theme",
     "name": "My Theme",
     "author": "me",
     "version": "0.1.0",
     "license": "MIT",
     "description": "One sentence about the vibe.",
     "tags": ["dark","neon"],
     "files": { "css": "theme.css", "readme": "README.md" },
     "status": "active"
   }
   ```
4. **Write `theme.css`.** Only override `--holo-*` variables. Scope everything under `.console-theme-my-theme` so themes can coexist on the same page. Keep it under 8 kB. No `@import`. No remote URLs.
5. **Optionally** add `preview.png` (960×600) and reference it in `files.preview`. Themes without previews still work but won't show in the built-in picker.
6. **Regenerate the index:**
   ```bash
   node scripts/build-registry.mjs
   ```
7. **Open a PR** using the *Theme submission* template. CI validates in under a minute.

### Applying a theme in your host

```jsx
// Fetch the theme CSS at runtime (works for registered themes in the index)
import { useEffect } from "react";
import { fetchRegistry } from "@twobitedd/console-network";

useEffect(() => {
  fetchRegistry().then(({ themes }) => {
    const theme = themes.find((t) => t.id === "my-theme");
    if (!theme?.css) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = theme.css;
    document.head.appendChild(link);
    document.body.classList.add("console-theme-my-theme");
  });
}, []);
```

Or just include it statically at build time if you know ahead which theme you want:

```html
<link rel="stylesheet" href="https://raw.githubusercontent.com/twobitEDD/console-network/main/registry/themes/my-theme/theme.css" />
<body class="console-theme-my-theme">
```

## Publish a project

1. Fork the repo (same as above).
2. `cp -R registry/projects/_template registry/projects/my-project`
3. Edit `project.json` — the fields that matter:
   - `url` — the live landing page users will open from the Connections panel
   - `description` — 12–280 chars, plain English, honest
   - `chainIds` — `[]` if off-chain, otherwise the actual chain IDs you use
   - `category` — one of game / app / tool / collection / community / experiment
   - `usesConsoleNetwork` — `true` if you mount `@twobitedd/console-network`; `false` is totally fine and shows an "adjacent" chip on your card
4. Optionally add `cover.png` (1200×630) and `icon.png` (256×256).
5. `node scripts/build-registry.mjs`
6. Open a PR using the *Project submission* template.

## No-PR path

Don't want to set up git? Open an [issue using the **Theme submission** or **Project submission** form](https://github.com/twobitEDD/console-network/issues/new/choose). Fill in the fields and a maintainer will open the PR for you.

## Automated checks (what CI runs on your PR)

| Check                                               | Blocks merge? |
|-----------------------------------------------------|---------------|
| Every manifest matches its JSON Schema              | yes           |
| Folder name == `id` == `slug`                       | yes           |
| Every file declared in `files.*` exists on disk     | yes           |
| No duplicate ids                                    | yes           |
| `registry/index.json` is freshly regenerated        | yes           |
| `description` length / character constraints        | yes           |

Everything else is a human review.

## After your PR merges

- Within minutes the CDN picks up the new `registry/index.json` and every running console sees your entry on its next fetch.
- No npm publish is required. No redeploy of `@twobitedd/console-network` is required.
- If you bump your theme's `version`, existing consumers still work — the `css` URL points at the file currently on `main`. There is no version selection in the registry today; that's a `v2` feature.
