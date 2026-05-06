# Themes

One folder per theme. Folder name must equal the theme's `id`.

Required files:
- `theme.json` — manifest ([schema](../_schema/theme.schema.json))
- `theme.css` — the stylesheet. Only override `--holo-*` custom properties. No imports.

Recommended files:
- `preview.png` — 960×600, shows the theme applied to a rig
- `README.md` — credits, design notes

Shipping examples in this repo: **noxcruiser**, **essential**, **bramble-stack**, **emerald-hauler**, **violet-frequencies**, **arctic-relay**.

See `_template/` for a minimal starting point.
