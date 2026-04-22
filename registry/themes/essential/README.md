# Essential

A paper-white daytime rig. The deliberate opposite of Noxcruiser: bone-white plastic, graphite phosphor, soft slate shadows, no CRT bloom.

## When to pick it

- Light-mode sites that want the console rig without inverting their surrounding palette.
- Accessibility sweeps where the cyan halation of Noxcruiser muddies contrast.
- Print / screenshot workflows — the theme reads cleanly on paper and in monochrome.

## Design

| Token                     | Value                         | Purpose                         |
|---------------------------|-------------------------------|---------------------------------|
| `--holo-plastic`          | `#f5f3ee`                     | Chassis fill (bone)             |
| `--holo-plastic-hi`       | `#ffffff`                     | Chassis highlight               |
| `--holo-plastic-lo`       | `#e4e1d9`                     | Chassis shadow / recess         |
| `--holo-warning`          | `#334155`                     | Phosphor / LED accent (graphite)|
| `--holo-phosphor`         | `rgba(51, 65, 85, 0.26)`      | Phosphor halation               |
| `--holo-rig-border`       | `rgba(15, 23, 42, 0.18)`      | Rig outline                     |
| `--holo-rig-shadow-glow`  | `rgba(15, 23, 42, 0.06)`      | Soft drop-shadow                |

Pairs well with neutral page backgrounds (`#fff` → `#eee`). Contrast against `#fff`:

- Graphite phosphor on bone — ~6.5:1 (WCAG AA body text, AAA large text).
- Rig border on bone — decorative; not relied on for information.

## Usage

```jsx
<ConsoleHost module={myGame} theme="essential" />
```

Adds `console-theme-essential` to the rig element and the tokens above cascade in.
