# Theming

Every color in the rig flows through CSS custom properties prefixed `--holo-*`. To re-skin, override them in any scope — no JS config, no recompile.

## Minimal theme

```css
.my-retro-console {
  --holo-plastic: #2a2118;
  --holo-plastic-hi: #3b2f22;
  --holo-plastic-lo: #150f09;
  --holo-warning: #f97316;
  --holo-led: linear-gradient(180deg, #fde047, #b45309);
  --holo-glass-viewport-on-bg: radial-gradient(#1a1208, #000);
  --holo-glass-viewport-on-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.35);
}
```

```jsx
<div className="my-retro-console" style={{ height: "100dvh" }}>
  <ConsoleHost module={myGame} />
</div>
```

## Full variable surface

All variables are declared with `:where(.edd-holo-rig)` so specificity is 0 — your override always wins. The defaults match a cyan-phosphor "noxcruiser" theme.

### Rig shell
- `--holo-plastic`, `--holo-plastic-hi`, `--holo-plastic-lo` — the chassis plastic ramp
- `--holo-warning` — the vertical warning strip
- `--holo-phosphor` — ambient phosphor glow
- `--holo-rig-bg`, `--holo-rig-border`, `--holo-rig-shadow-glow`
- `--holo-rig-plate-bg`, `--holo-rig-plate-id`, `--holo-rig-plate-rev`
- `--holo-rail-tick`, `--holo-rail-inset-line`, `--holo-rail-right-inset`
- `--holo-led`, `--holo-led-glow`

### Lens / viewport
- `--holo-glass-lens-bg`, `--holo-glass-lens-shadow`, `--holo-glass-lens-off-bg`
- `--holo-glass-lens-arc`
- `--holo-glass-viewport-bg`, `--holo-glass-viewport-border`
- `--holo-glass-viewport-on-bg`, `--holo-glass-viewport-on-shadow`
- `--holo-glass-tint`
- `--holo-glass-caption`

### Footer
- `--holo-footer-bg`, `--holo-footer-channel`, `--holo-footer-wave`
- `--holo-rig-power-*` (color/bg/border/standby variants)
- `--holo-rig-reset-*`

## Channel frame colors

Channel panels use their own rgb colors (not yet variable-ized in v0.1). If you need to re-color the α/β/MODAL/HUD panel borders, override the class rules directly:

```css
.my-retro-console .holo-overlay__panel--frame1,
.my-retro-console .holo-overlay__panel--frame2 {
  border-color: rgba(249, 115, 22, 0.55);
  background: rgba(28, 18, 10, 0.94);
}
```

Promoting these to `--holo-frame-*` variables is on the v0.2 list — see [Design review](./08-design-review.md).

## Theme packs

Shipping theme packs as sub-exports is on the roadmap:

```js
import "@twobitedd/console-network/themes/noxcruiser.css";
import "@twobitedd/console-network/themes/salvage-yard.css";
```

Until then, copy the block above, rename the scope class, and commit it in your own app.

## Dark/light

Every default is assumed dark. A light mode is not part of v0.1. If you ship one, the convention should be:

```css
@media (prefers-color-scheme: light) {
  :where(.edd-holo-rig) {
    /* your light overrides */
  }
}
```

...but honestly, the console language is fundamentally dark. A light console is a different product.
