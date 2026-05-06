# Testing & performance

How to verify `@twobitedd/console-network` locally and before a release.

## Automated (CI)

From the **monorepo root** (not `package/`):

| Command | What it does |
|--------|----------------|
| `npm test` | Builds the library, then runs **all** `test/*.test.mjs` files (contracts, registry, exports, **bundle gzip budgets**, **static feature surface**, **jsdom ConsoleHost mounts**). |
| `npm run lint` | ESLint across the repo + package `src/`. |
| `npm run perf:size` | Prints raw + **gzip** bytes for `console-network.{es,cjs}.js` and `style.css`. Requires `package/dist/` (run `npm run build:console` first if needed). |
| `npm run release:check` | `lint` → full `build` (library + demo) → tests (without rebuilding the library again) → registry `--check`. Use before tagging a release. |

GitHub Actions runs `npm run lint`, `npm test`, and `npm run registry:check`.

## Bundle budgets

`test/performanceBudget.test.mjs` caps **gzip** sizes for the shipped ESM bundle, CJS bundle, and copied `style.css`. If you intentionally grow the payload (new UI or adapters), bump the `BUDGETS` map in that file in the same PR.

This is a **regression guard**, not a substitute for profiling heavy scenes in your game (Canvas/WebGL, layout thrash, etc.).

## Feature coverage (recent shell work)

| Area | Automated |
|------|-----------|
| Immersive host / rig classes | `test/consoleHostMount.test.mjs` |
| `api.presentation` | `test/consoleHostMount.test.mjs` |
| `visualTier` extra vs potato (lens overlays) | `test/consoleHostMount.test.mjs` |
| `api.shell.setImmersiveDeckPinned` | `test/consoleHostMount.test.mjs` |
| CSS + source markers (immersive, tiers, breathe/prism) | `test/featureSurface.test.mjs` |

## Manual / demo

Run the interactive app:

```bash
npm run dev:demo
```

Use the **presentation** and **visual tier** controls in the top-left toolbar. In **immersive** mode, hover the bottom peek strip or use **pin toggles** from the viewport copy (wired through `api.shell`).

For pixel-level motion (breathing lens, reactive glow), use **`visualTier="extra"`** and compare with **`potato`**.

## Publishing `@twobitedd/console-network`

1. `npm run release:check`
2. Bump `package/package.json` version + `CHANGELOG.md`.
3. Tag from `main` and publish from `package/` (`npm publish` respects `prepublishOnly` → build).

The workspace root `package.json` version is kept aligned for monorepo sanity only; npm publishes **`package/`**.
