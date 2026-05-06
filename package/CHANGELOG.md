# Changelog

All notable changes to `@twobitedd/console-network` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.6] - 2026-05-06

### Changed
- **Side rail chrome:** hover/active feedback targets **`edd-holo-rig__ticks`**, **`edd-holo-rig__led`**, **`edd-holo-rig__vents`**, and **screw** discs directly instead of brightening or squeezing the whole rail column.

[0.1.6]: https://github.com/twobitEDD/console-network/releases/tag/v0.1.6

## [0.1.4] - 2026-05-06

### Added
- **`ConsoleHost` props:** `presentation` (`"default"` \| `"immersive"`) and **`visualTier`** (`"potato"` \| `"balanced"` \| `"extra"`).
- **`api.presentation`** — mirrors host presentation so modules can branch UX without external props.
- **`ConsoleShellApi` on `api.shell`:** `immersiveDeckPinned`, **`setImmersiveDeckPinned`** for immersive / fullscreen-style deck pinning.
- **Lens polish when `visualTier="extra"`** — breathe layer, prism + reactive glow, optional soft halo on the physical lens (honors reduced motion / `effects`).
- **Demo toolbar** (`examples/demo`) for switching presentation + tier; viewport hint + shell pin control when immersive.
- **Testing:** gzipped **bundle budgets** (`test/performanceBudget.test.mjs`), **static feature surface** checks (`test/featureSurface.test.mjs`), **jsdom mount tests** for immersive/tier/shell (`test/consoleHostMount.test.mjs`), `npm run perf:size`, **`npm run release:check`**, and **`docs/11-testing-and-performance.md`**.

### Changed
- **Immersive layout CSS:** viewport-first grid; plate/rails tucked away; channel deck **peek dock** from the bottom edge.
- Pointer-driven **`--edd-glow-x` / `--edd-glow-y`** on the lens for extra-tier overlays (coalesced with existing rAF path).

[0.1.4]: https://github.com/twobitEDD/console-network/releases/tag/v0.1.4

## [0.1.3] - 2026-05-05

### Added
- **`ConsoleHost` props:** `effects` (`"full"` \| `"lite"`), `respectReducedMotion` (default `true`), and dev-only **`debug`** logging (`NODE_ENV !== "production"`).
- **`pickConsoleIdentityFields`**, **`DEFAULT_CONSOLE_IDENTITY`**, **`usePrefersReducedMotion`** (exported).

### Changed
- **Stable `api.identity`:** normalized from primitive identity fields so a fresh provider object per render does not recreate `api` when `handle` / `address` / `isAuthenticated` are unchanged.
- **Stable `api.chain`:** memoized on `chainId` plus thin bridge fn refs when provided.
- **Plate derivation:** `derivePlate(module)` memoizes on stable module fields (`id`, `version`, `title`, plate overrides), not the whole `module` reference.
- **`GameModule.onMount`:** runs once per **`module.id`**; receives latest `api` via ref — rely on `api` props inside your component for live identity updates (contract docs updated).
- **`useConsoleChannels`:** channel **`state`** and **`set`** snapshots are memoized so subtree comparisons skip needless churn.
- **`HoloFrameConsole`:** `motionReduced` + `forceFullMotionCss` for lite chrome / opting back into CSS motion when ignoring reduced-motion prefs.

### Documentation
- Identity memoization, motion props, and WDYR note added to README + `docs/05-identity.md`.

[0.1.3]: https://github.com/twobitEDD/console-network/releases/tag/v0.1.3

## [0.1.2] - 2026-05-05

### Fixed
- **Crash on load (React #185):** Slot registration no longer drives `setState` on `ConsoleHost`. Slot maps live in a small external store; `HoloShellFromSlots` subscribes with `useSyncExternalStore`, so updating projected slot content does not re-render the game module in the same synchronous layout pass. This removes the max-update-depth loop triggered when slot children are new element references every render (common with inline JSX) combined with `useLayoutEffect` registration.
- **`ConsoleSlotProvider`:** Context value is memoized so `register` / `unregister` references stay stable across unrelated host re-renders.

[0.1.2]: https://github.com/twobitEDD/console-network/releases/tag/v0.1.2

## [0.1.1] - 2026-05-05

### Fixed / performance
- **Console slots:** Mount/unmount registration is stable on `[ctx, channel, key]`; slot content updates call `register` without an intermediate `unregister`, avoiding duplicate `setSlots` churn on `ConsoleHost` when parent re-renders produce new React element references for slot children.
- **Holo lens parallax:** Pointer-driven CSS variables are coalesced with `requestAnimationFrame` (at most one `getBoundingClientRect` + style update per frame). Pending rAF is cancelled on pointer leave and on unmount.

### Changed
- **ConnectionsPanel:** Registry URL cache reset when `registryUrl` changes uses the render-phase snapshot pattern (same behavior; satisfies `react-hooks/set-state-in-effect` lint).

[0.1.1]: https://github.com/twobitEDD/console-network/releases/tag/v0.1.1

## [0.1.0] - 2026-04-21

### Added
- Initial public release of the Console Network framework.
- `HoloFrameConsole` + `ConsoleHost` host components.
- `ConsoleSlots` namespace (Viewport / Left / Right / Center / Bottom).
- `useConsoleChannels` hook.
- `defineGameModule` / `derivePlate` game-module contract.
- `identityFromDynamic` adapter for Dynamic.xyz identity.
- `ConnectionsPanel` with registry-backed project directory.
- Registry helpers: `fetchRegistry`, `matchProject`, `collectTags`, `DEFAULT_REGISTRY_URL`.
- Bundled stylesheet (`@twobitedd/console-network/styles.css`).

[0.1.0]: https://github.com/twobitEDD/console-network/releases/tag/v0.1.0
