# Design review — v0.1 → v1.0

This is a candid list of what's rough in the current design and what should change before v1 locks. Anyone evaluating whether to build on this should read it; anyone contributing PRs should pick from it.

Items are labeled by priority for v1:

- **[P1]** — should land before v1.
- **[P2]** — nice-to-have; won't block v1 but strongly wanted.
- **[P3]** — longer-term / speculative.

---

## 1. API surface

### [P1] Stable `api` reference across renders
**Problem.** `ConsoleHostApi` is rebuilt whenever any of its inputs change, which cascades into `useEffect` deps inside modules. For games doing 60fps state updates this can subtly thrash.

**Fix.** Split `api` into a stable *handle* (`channels`, `emit`, `t`) plus a **ref-like** `identity`/`chain` surface exposed through a subscription hook:

```jsx
const identity = useConsoleIdentity(api);  // subscribes only when relevant fields change
```

The module-facing contract stays the same; the implementation guarantees stability.

### [P1] Promote `api.t` to a typed namespace
**Problem.** `api.t(key, fallback)` is a thin passthrough today. Modules compete over key prefixes.

**Fix.** Host gives each module a namespaced resolver: `api.t` auto-prefixes with `modules.<id>.` so modules don't need to coordinate keys. Globals go through `api.t.global("key")`.

### [P2] Event bus: `api.on` / `api.emit`
**Problem.** `emit` exists but `on` doesn't. Cross-module comms is impossible.

**Fix.** Ship a small typed bus on the host. Modules can `api.on("match:ended", handler)` to react to other modules' events. Required for future Level-3 federation (message passing).

### [P2] Storage & persistence API
**Problem.** Every module reinvents `localStorage`. No boundary on quotas, no migration.

**Fix.** `api.storage.get/set/subscribe(key)` scoped by module id. Host can pick the backend (`localStorage`, IndexedDB, remote KV). Capability flag `requiresPersistentStorage` gates.

### [P3] Router / navigation
**Problem.** Module-to-module transitions are ad hoc.

**Fix.** `api.navigate(moduleId, params?)` handled by the host. Lets a module say "now show the leaderboard module" without knowing the URL scheme.

---

## 2. Slot / channel system

### [P1] CSS variable-ize the frame panel colors
**Problem.** The α/β/MODAL/HUD panel borders and backgrounds are hardcoded RGB today. Themes have to override CSS rules instead of just setting variables — that's a worse integration surface.

**Fix.** Introduce:

```
--holo-frame1-bg / --holo-frame1-border / --holo-frame1-shadow
--holo-frame2-*
--holo-frame3-*
--holo-frame4-*
```

Defaults keep the current red/red/pink/green, but themes get a clean hook.

### [P1] Slot merge semantics
**Problem.** If two places in a module render `<ConsoleSlots.Center>`, both get collected and stacked. Sometimes you want that (multiple toast layers); sometimes you want replace-wins.

**Fix.** Either:
- Make slots single-child by default; `<ConsoleSlots.Center multi>` opts into stacking, OR
- Add an explicit `<ConsoleSlots.Center layer="base">`…`<ConsoleSlots.Center layer="top">` ordering API.

Current behavior is "everything stacks in registration order", which is surprising.

### [P1] Auto-close peer modals
**Problem.** Nothing prevents α, β, MODAL, and HUD from all being open at once, obscuring the viewport.

**Fix.** Host policy: opening MODAL auto-collapses α/β; opening α closes β (they're mutually exclusive as side rails); HUD stays independent. Policy should be overridable per host.

### [P2] Extensible channel registry
**Problem.** The 5 slots are hardcoded in multiple places (`ConsoleHost`, `HoloFrameConsole`, `useConsoleChannels`, `ConsoleSlots`, CSS). Adding a new slot is a 6-file diff.

**Fix.** Central slot-registry object consumed by all three layers:

```js
export const SLOTS = {
  viewport: { position: "fill" },
  left:     { position: "side",   side: "left",   motion: "slide-x" },
  right:    { position: "side",   side: "right",  motion: "slide-x" },
  center:   { position: "center", motion: "scale-fade" },
  bottom:   { position: "chin",   motion: "slide-y" },
};
```

Everything derives from that map. Adding a slot becomes one entry + one CSS rule.

### [P3] Slot *hints* instead of fixed positions
Long-term: a module just declares intent (`"list"`, `"modal"`, `"hud"`, `"toast"`) and the host picks a channel. Allows hosts to reflow on narrow screens without modules knowing.

---

## 3. Plate & presence

### [P1] Live plate dashlets
**Problem.** The plate is cosmetic. Across the network, a user reading the plate should be able to tell at a glance "what am I looking at": turn counter, player count, TX status.

**Fix.** Add `<ConsoleSlots.Plate>` (or `<ConsoleSlots.Badge>`). Plate is a very narrow slot with strict typographic constraints — text only, max 2 dashlets, no interactivity.

### [P2] Presence / telemetry LEDs
The three fake LEDs on the plate should be data-driven. Proposal: `api.status({ color: "green"|"amber"|"red", label })` updates the LEDs and publishes to federated telemetry.

---

## 4. Identity & chain

### [P1] Subscription-based identity reads
**Problem.** `api.identity` is a snapshot passed by prop. If identity changes mid-mount (user signs in from a β-rail button), modules have to re-read the prop; some get it stale.

**Fix.** Expose `useConsoleIdentity()` hook (and imperative `api.identity.subscribe(cb)`). Source of truth is the host; module hook reads live state.

### [P2] Capability declarations surfaced to users
If a module says `requires.requiresWallet`, the *host* should show a "this module needs a wallet" explainer before mount, not have each host implement it ad hoc. Ship a reference `<CapabilityGate>` component with the package.

### [P2] Chain surface needs a concrete client option
`ConsoleChain` is abstract on purpose, but every consumer re-writes the same `viem` wrapper. Ship `@twobitedd/console-chain-viem` that returns a `ConsoleChain` from a viem public/wallet client pair.

---

## 5. Framework neutrality

### [P2] Extract `@twobitedd/console-spec` (the pure spec)
The spec (grammar, motion, frames, capability flags, module.json) should be its own repo / package with *no code*. That's what non-React implementations read.

### [P3] Extract `@twobitedd/console-protocol` (postMessage types)
For Level-3 federation (cross-origin modules), a small types-only package defines the wire format. Both host and sandboxed module import it.

### [P3] A `ConsoleHostOrchestrator` that speaks both React-inline and postMessage
Today `ConsoleHost` only mounts in-process React modules. A future variant accepts `module: GameModule | ModuleManifest` and auto-picks React mount or iframe postMessage mount depending on what the manifest says.

---

## 6. Accessibility

### [P1] Focus trap for MODAL
When the center channel opens, focus should move into it and tab should wrap. ESC should dismiss (unless the module opts out). Ship a `FocusGate` inside the MODAL overlay by default.

### [P1] Announce channel state changes
Every channel open/close should dispatch `aria-live="polite"` announcements (e.g. "Match history opened"). Host owns the announcer; module strings come from the module's i18n.

### [P2] Reduce-motion deep pass
The CSS respects `prefers-reduced-motion`, but JS-driven things (viewport parallax, channel toggle animations) should also snap when reduce-motion is set. Audit needed.

---

## 7. Developer experience

### [P1] TypeScript `.d.ts` emission
JSDoc types are fine for autocomplete but many authors expect real `.d.ts`. Generate via `tsc --emitDeclarationOnly` or switch the package source to TS. Leaning toward the former to keep source authoring simple.

### [P1] Testing kit
Ship `@twobitedd/console-testkit`:
- `renderModule(mod, { identity, chain, initialChannels })` — returns slots + api + imperative helpers
- Basic a11y assertion helpers
- Storybook addon to render a module under the rig

### [P2] Dev-mode visible grid
A `?console-debug=1` query param that outlines the 5 slot rects + shows channel toggle hot zones. Makes module authoring way faster.

### [P3] Playground app
A small host at `playground.console.network` that accepts any npm module id and mounts it. Lets authors share working demos without running a full site.

---

## 8. Versioning & federation

### [P1] Spec version in the module manifest
Modules should declare which spec version they target: `spec: "console-network/0.1"`. Hosts warn when a module is older than their spec.

### [P2] Registry spec (JSON schema)
Define the format for a module registry JSON once and freeze it. Enables third-party registries.

### [P3] Signed manifests
`module.json` with a `signature` field from the publisher's wallet. Hosts choose to trust registries or individual publishers. No central authority.

---

## Open questions

1. **Multi-module composition.** Can two modules coexist inside one host (one in viewport, one in β rail)? If yes, who owns the plate? Probably: viewport module owns the plate; side modules register dashlets via the plate slot.

2. **Inter-module capabilities.** Should a module be able to *request* that another module mount? Risky. Probably no for v1; revisit if real use cases emerge.

3. **The word "game".** The contract is called `GameModule` but nothing in the design is game-specific. Rename to `ConsoleModule` for v1? Pro: honest. Con: breaks existing imports. Probably do it and ship a deprecation alias.

4. **Theme registry.** Who curates themes? Probably the same answer as module registry: anyone, signed, federated.

---

## Prioritized cut list for v1

If we had to ship v1 in 6 weeks, this is the order:

1. CSS variable-ize frame colors (theming friction is the biggest turnoff today)
2. Stable `api` reference + subscription identity
3. `ConsoleSlots.Plate` + focus trap for MODAL
4. TypeScript `.d.ts` emission
5. Slot merge semantics + auto-close peer modals
6. Testing kit
7. Spec version in manifests
8. Event bus (`api.on`)
9. Rename `GameModule` → `ConsoleModule` with alias
10. Extract `@twobitedd/console-spec`

Everything else is v1.x / v2.
