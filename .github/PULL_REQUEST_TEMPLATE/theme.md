---
name: Theme submission
about: Register a new theme in the Console Network registry
labels: ["registry", "theme"]
---

## Theme

<!-- Drop your theme's folder name here, e.g. `noxcruiser` -->
**Slug:** 

**Live preview (URL or screenshot):**

## Checklist

- [ ] Folder at `registry/themes/<slug>/` with `theme.json` + `theme.css`
- [ ] Folder name matches `id` and `slug` in `theme.json`
- [ ] `theme.css` only overrides `--holo-*` custom properties, scoped under `.console-theme-<slug>`
- [ ] `theme.css` is self-contained (no `@import`, no remote URLs), under 8 kB
- [ ] `preview.png` checked in (960×600 recommended) OR I accept that my theme won't appear in the built-in picker
- [ ] `registry/index.json` regenerated (`node scripts/build-registry.mjs`)
- [ ] I'm listing the theme under an SPDX-valid license and have the right to publish it
- [ ] I've read and agree to the [Code of Conduct](../CODE_OF_CONDUCT.md)

## Anything reviewers should know?

<!-- Design notes, accessibility contrast checks, known limitations, etc. Optional. -->
