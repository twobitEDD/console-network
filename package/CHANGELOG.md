# Changelog

All notable changes to `@twobitedd/console-network` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
