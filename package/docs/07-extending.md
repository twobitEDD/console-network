# Extending the host

This is the contributor-facing doc. If you're writing a module, [Game modules](./02-game-module.md) is what you want. If you're building a new host — or adding a new capability to the reference host — read on.

## How the reference host is wired

Four pieces that play together:

1. **`HoloFrameConsole`** — pure presentation. Knows nothing about modules. Takes `viewport` + 4 channel nodes + flags.
2. **`ConsoleSlotProvider`** + `ConsoleSlots.*` — a tiny context-based registry. Slots register themselves into a map on mount, unregister on unmount. Reads go through React state so the host re-renders when slot contents change.
3. **`useConsoleChannels`** — headless state for `{ left, right, center, bottom, power }` plus setters and an imperative `api`.
4. **`ConsoleHost`** — glue that owns the state, constructs the `api`, wraps the module's `Component` in a `ConsoleSlotProvider`, and pipes the collected slot nodes into `HoloFrameConsole`.

You can use any of these in isolation. If you only need the rig, import `HoloFrameConsole` directly; if you want a headless console for a non-React renderer, consume `useConsoleChannels` + implement your own slot collector.

## Adding a new slot (e.g. a corner sticker)

1. **Decide whether it belongs.** The 5-slot spec is the shared design language — don't add a slot just because your module needs a UI affordance. If it's genuinely a new channel *class* (like a persistent toast rail or a top banner), keep going.
2. Add a **slot wrapper** in `ConsoleSlots.jsx`:
   ```jsx
   export function TopSlot({ children }) { useSlot("top", children); return null; }
   ```
   and register it on the `ConsoleSlots` aggregator in `index.js`.
3. Extend `EMPTY_SLOTS` in `ConsoleHost.jsx` to include `top: {}` and render it: `renderChannel("top")`.
4. Teach `HoloFrameConsole` about the new channel: a `topChannel` prop, matching overlay markup inside `holo-overlay-root`, a `.holo-overlay--top` CSS block with its own motion grammar.
5. Extend `useConsoleChannels` with `topOpen` / `setTop` and the imperative `api.setTop`.
6. **Update the spec doc and README tables** so other implementations and module authors know about it.

If this sounds like a lot, that's intentional — adding a slot is a spec-level change. Minor cosmetic tweaks should happen via theming instead.

## Adding a capability flag

Capabilities are how modules declare requirements the host must satisfy before they mount. To add one:

1. Extend the `requires` type in `contracts.js`:
   ```js
   /** @property {boolean=} requiresFullscreen */
   ```
2. Write a host-side check. For the reference host, this belongs above `ConsoleHost` in the app route, not inside the package — hosts differ in how they want to prompt.
3. Document it in [Game modules](./02-game-module.md) and [Federation](./06-federation.md).

Common candidates for future capability flags:

- `requiresMicrophone`, `requiresGamepad` — sensor access
- `requiresPortrait` / `requiresLandscape` — viewport constraints
- `requiresPersistentStorage` — IndexedDB quota
- `minSpecVersion` — spec version the module was authored against (host may warn if older)

## Driving plate telemetry

The plate currently shows static `{ plateId, plateRev }`. To make it live (current score, players online, turn counter), the cleanest evolution is to let modules register **plate dashlets**:

```jsx
<ConsoleSlots.Plate>
  <span>Turn {turn}</span>
  <span aria-live="polite">{Math.max(0, timer)}s</span>
</ConsoleSlots.Plate>
```

`HoloFrameConsole` can then render the plate content area as a sub-slot. This is a small lift and is on the v0.2 list.

## Making it non-React-friendly

The current slot system is React-only. For Level 2 / Level 3 federation (see [Federation](./06-federation.md)), a neutral protocol is needed:

- Define the host-side API as a plain event bus: `post("console:slot", { slot, payload })` / `on("console:channel", cb)`.
- Ship a tiny `@twobitedd/console-protocol` package that's just types + constants — zero React dependency.
- The React `ConsoleHost` becomes a thin adapter over the protocol. Svelte / vanilla / Godot hosts implement the same protocol.

This is explicitly designed into the shape of the current API so the evolution is non-breaking: everything `ConsoleHost` passes into a module today can be round-tripped as messages tomorrow.

## Custom hosts

Want to build your own host (say, for a Tauri desktop app that embeds the console in a native window)?

Start here:

```jsx
import { HoloFrameConsole } from "@twobitedd/console-network";

function MyHost({ viewport, leftChannel, rightChannel, centerChannel, bottomChannel }) {
  const [on, setOn] = useState(true);
  return (
    <HoloFrameConsole
      plateId="MY-HOST"
      plateRev="REV 0.1"
      caption="desktop"
      viewport={viewport}
      leftChannel={leftChannel}
      rightChannel={rightChannel}
      centerChannel={centerChannel}
      bottomChannel={bottomChannel}
      displayOn={on}
      onDisplayToggle={setOn}
      engageLabel="ENGAGE"
      standbyLabel="STANDBY"
      leftToggleLabel="α"
      rightToggleLabel="β"
      centerToggleLabel="MODAL"
      bottomToggleLabel="HUD"
    />
  );
}
```

From there, swap in your own module registry / identity provider / chain client.

## Tests & playground

There's no test harness shipped in v0.1. A `@twobitedd/console-testkit` package is on the roadmap, offering:

- `renderModule(module, { identity, chain })` that returns `{ slots, api }`
- `storybook`-ready stories per channel
- An `axe` a11y check preset tuned to the shell

Until that exists, write regular React Testing Library tests against your module's `Component`, passing a mock `api` prop directly.

## PR checklist for contributions

When opening a PR against the reference implementation:

- [ ] Spec-level changes (new slots, new lifecycle) are documented in `docs/03-channels.md` and `docs/06-federation.md`.
- [ ] Type additions mirrored in `src/contracts.js` JSDoc.
- [ ] CSS changes keep all existing `--holo-*` variables working (add new ones; don't rename).
- [ ] `npm run build:console` produces no new bundle warnings.
- [ ] `npx eslint package/src` is clean.
- [ ] If you're adding federation surface, include a minimal handshake test.
