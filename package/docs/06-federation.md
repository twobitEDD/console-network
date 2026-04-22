# Federation — the "unified console" vision

Most users won't know or care that they're visiting different websites. If the rig is the same and the grammar is the same, the network feels like a single device with many channels — like a retro TV, or a game console storefront, where each "cartridge" is a different site.

This document lays out how that works in practice.

## Three levels of federation

Pick the one that fits you — they're not exclusive.

### Level 1 — shared code, same device

You import `@twobitedd/console-network` and ship your own modules. Every site that does this looks identical to a user, even when each site runs its own backend / DB / contracts.

- **Pros:** trivial to adopt. Just install the package.
- **Cons:** you're locked to the React reference host and the published rig.

### Level 2 — shared design spec, independent implementations

You don't import our package. You implement the **Console Spec** (see below) in your language / framework of choice. A native mobile app or a Svelte site can sit next to a React site and still feel like the same console.

- **Pros:** no runtime coupling. You own your stack end-to-end.
- **Cons:** you are responsible for staying in sync with the spec version.

### Level 3 — cross-origin module federation

A single host loads modules served from other origins via a thin protocol (sandboxed iframe + postMessage handshake). Users on your site can play a game module published by someone else, who hosts it entirely on their own infrastructure.

- **Pros:** true federation. Anyone can publish a module without asking permission.
- **Cons:** sandboxing cost, protocol discipline, trust surface. See "Module protocol" below.

## The Console Spec (v0.1 draft)

The minimum contract another implementation must honor to be recognized as "a console":

1. **Five slots** — viewport + left + right + center + bottom. No more, no fewer, at least at the baseline. Extensions live in a separate registry (see [Extending](./07-extending.md)).
2. **Motion grammar** — left/right slide horizontal, center scale+fade, bottom slide-up. Respects `prefers-reduced-motion`.
3. **Frame colors** — default red / red / pink / green on frames 1–4. Themes may override but should keep the *relative* palette (α and β are peers; MODAL is warmer; HUD is cooler/greener).
4. **Rig chrome** — rounded lens with top arc highlight, rail + LED strip, plate with id/rev/LEDs, footer with power + channel toggles + standby/engage.
5. **Identity contract** — consoles expose `{ isAuthenticated, handle, address }` to modules. Wallet-first. Other auth allowed but address is the portable key.
6. **Capability flags** — modules declare `requires.chainIds` / `requires.requiresWallet` and hosts honor them.

The spec doesn't say *which* CSS variables to use or *which* React component — only the user-visible grammar. You could implement it in Godot if you wanted.

## Module protocol (cross-origin federation, v1 sketch)

When Level 3 federation lands, a module is served from its own origin and described by a static `module.json`:

```json
{
  "id": "galaxy-drift",
  "version": "2.3.0",
  "title": "Galaxy Drift",
  "entry": "https://galaxydrift.example/module.js",
  "icon":  "https://galaxydrift.example/icon.svg",
  "requires": {
    "chainIds": [8453],
    "requiresWallet": true
  },
  "spec": "console-network/0.1",
  "publisher": { "handle": "drifter", "address": "0x…" },
  "signature": "0x…"
}
```

The host renders the module in a sandboxed iframe and speaks a postMessage protocol:

| Message from host → module         | Effect                                         |
|------------------------------------|------------------------------------------------|
| `console:handshake`                | Sent on mount, includes `api` surface version |
| `console:identity`                 | `{ handle, address, isAuthenticated }`        |
| `console:chain`                    | `{ chainId }`                                 |
| `console:visibility`               | `{ power: boolean }`                          |
| `console:teardown`                 | Unmount imminent                               |

| Message from module → host         | Effect                                         |
|------------------------------------|------------------------------------------------|
| `console:ready`                    | Module is painted; show the rig                |
| `console:slot`                     | `{ slot: "center", html?: string, url?: string }` — registers overlay content |
| `console:channel`                  | `{ slot: "center", open: boolean }`            |
| `console:signIn` / `console:signOut` | Request identity actions                     |
| `console:sign` / `console:tx`      | Request wallet signing / tx                    |
| `console:emit`                     | Analytics / cross-module events                |

Slot content can be either an HTML string (fast, limited) or a nested iframe URL (full-featured, sandboxed). Because the host owns the chrome, visual consistency is guaranteed regardless of what the module renders internally.

This lives in v0.3 territory, but the rest of the API is already designed to make it painless — module authors writing against the in-process `ConsoleHostApi` today will get a 1:1 postMessage version for free tomorrow.

## Module discovery / registry

A **registry** is just a JSON file listing trusted `module.json` URLs:

```json
{
  "name": "twobitedd/default",
  "curated_at": "2026-05-01T00:00:00Z",
  "modules": [
    "https://galaxydrift.example/module.json",
    "https://superttt.example/module.json"
  ]
}
```

A host can subscribe to one or many registries, same way a Mastodon server federates with other instances. Modules can declare which registries they trust to relay them; registries can sign their lists.

No registry is planned to be central. The goal is a graph where anyone can stand up a registry and consoles can point at whichever they trust.

## What makes it feel "unified" to users

1. **Same rig, always.** Rails, plate, lens, chin, power — identical geometry.
2. **Same motion.** A channel sliding in on site A animates the same way on site B.
3. **Same hot zones.** α is always left list, β is always right list, MODAL is always center, HUD is always bottom.
4. **Same identity.** Wallet-first means your persona travels.
5. **Visible plate.** Every module announces `id`, `rev`, and publisher on the plate. Users learn to read it the same way they read a cartridge label.
6. **Optional theme variation, bounded palette.** Even when themes differ, the α/β/MODAL/HUD color *relationship* is preserved (warm for MODAL, cool for HUD).

If you build a console that breaks any of these, users will feel it immediately, even if they couldn't articulate why.

## Our role vs. yours

We publish:

- The reference React implementation
- The Console Spec (this doc + the channels doc)
- A default registry of modules we trust
- A Dynamic.xyz adapter as the path of least resistance

You publish:

- Your modules (as npm packages, standalone sites, or `module.json` bundles)
- Your registry, if you want one
- Your host site, themed to your brand but grammar-compliant

Everyone wins: the network gets richer every time a new module joins, no one has to give up control of their infra, and users get one device with a thousand cartridges.
