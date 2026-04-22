# Contributing to Console Network

The Console Network grows through pull requests. There are three flavors of contribution, each with a predictable, low-friction path:

| I want to…                       | Path                                                                                  | Review target |
|----------------------------------|---------------------------------------------------------------------------------------|---------------|
| Add a **theme**                   | PR under `registry/themes/<your-slug>/`                                               | Within 72 h    |
| Register a **project**            | PR under `registry/projects/<your-slug>/`                                             | Within 72 h    |
| Improve the **package**           | PR under `package/`                                                  | As capacity    |

If you don't know git, you can [open an issue](../../issues/new/choose) using the theme-submission or project-submission form — fill in the fields and a maintainer will commit the PR for you.

## Ground rules

1. **Be kind.** See [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
2. **Ship real work.** Manifests must link to live URLs. CI checks existence of the files you declare; maintainers spot-check that URLs resolve before merging.
3. **One entry per PR.** Makes review faster and rollbacks cleaner.
4. **Leave `_template/` folders alone.** They're the starter kit for the next person.

## Adding a theme

1. Copy `registry/themes/_template/` to `registry/themes/<your-slug>/` (lowercase kebab-case, 4–40 chars).
2. Edit `theme.json`. The shape is enforced by `registry/_schema/theme.schema.json`.
3. Drop your CSS into `theme.css`. Constraints:
   - Only override `--holo-*` custom properties. Don't target rig elements directly — it will break when other themes swap in.
   - Self-contained: no `@import`, no remote URLs, under 8 kB.
   - Scope everything under `.console-theme-<your-slug>` so multiple themes can coexist in a page.
4. Add a `preview.png` (960×600 recommended, < 400 kB). Optional but strongly encouraged — themes without previews won't appear in the built-in theme picker.
5. Regenerate the index:

   ```bash
   node scripts/build-registry.mjs
   ```

   Commit the updated `registry/index.json` alongside your changes. CI will fail otherwise.
6. Open a PR using the **Theme** template. Fill in the checklist.

### Theme checklist

- [ ] Folder name matches `id` and `slug` in `theme.json`
- [ ] `theme.css` only overrides `--holo-*` variables
- [ ] Preview image checked in and referenced in the manifest
- [ ] `version` bumped if you've merged a theme here before
- [ ] `registry/index.json` regenerated (`node scripts/build-registry.mjs`)
- [ ] Screenshots or link to a live preview in the PR description

## Registering a project

1. Copy `registry/projects/_template/` to `registry/projects/<your-slug>/`.
2. Edit `project.json`. Shape enforced by `registry/_schema/project.schema.json`.
3. Add `cover.png` (1200×630) and `icon.png` (256×256). Both optional but strongly encouraged.
4. Regenerate the index: `node scripts/build-registry.mjs`.
5. Open a PR using the **Project** template.

### Project checklist

- [ ] `url` points at a publicly reachable page
- [ ] `repo` is accurate (or omitted if closed-source)
- [ ] `description` is 12–280 chars of plain English
- [ ] `chainIds` reflects real usage (empty array if none)
- [ ] `requiresWallet` accurately set
- [ ] Cover + icon checked in
- [ ] `registry/index.json` regenerated

## Improving the package

PRs to `package/` are welcome. Before opening:

- `npm run test:network` passes
- `npm run build:console` succeeds
- `npm --workspace @twobitedd/console-network run lint` is clean
- If you changed the public API, update `docs/` and add at least one test in `test/`

## Review & merge

- A maintainer labels the PR within 48 hours.
- CI must be green. We don't merge red PRs.
- Registry PRs are merged when they pass CI and do no harm — we are **not** curating taste, we're curating safety.
- Package PRs get a light design review in addition to CI.

## Conflicts & disputes

Open an issue. Temporary hiding via `"status": "hidden"` is available while a dispute is resolved. Permanent removal requires a maintainer decision, which we'll document in the PR that removes the entry.

## License

By contributing, you agree that your contribution is licensed under **MIT** unless explicitly stated otherwise in the manifest's `license` field.
