# @twobitedd/console-network

> A reusable **holo-console framework** for building blockchain-powered interactive apps and games. Games plug in as modules, the console supplies the shell, identity, and the 4-channel overlay language.

The goal is a shared **design device**: dozens of independent sites, each running their own backend and their own modules, all appearing to users as the same console. Learn the rig once, every channel you visit reuses the same chassis.

```
 ┌────────────────── holo rig ──────────────────┐
 │  [ plate: id · rev · leds ]                  │
 │                                              │
 │   α RAIL         ░░░░░░░░░░░░░       β RAIL  │
 │  (left list)     ░░ viewport ░░    (right)   │
 │   slides in      ░░  supreme ░░    slides    │
 │   from left      ░░░░░░░░░░░░░      in from  │
 │                    ╔═ MODAL ═╗       right   │
 │                    ║ center  ║               │
 │                    ╚═════════╝               │
 │  ══════════════ HUD (bottom) ══════════════  │
 │  [ footer · power · toggles · standby ]      │
 └──────────────────────────────────────────────┘
```

## Install

```bash
npm install @twobitedd/console-network react react-dom
```

```js
// once, at your app root
import "@twobitedd/console-network/styles.css";
```

## 60-second tour

```jsx
import {
  defineGameModule,
  ConsoleHost,
  ConsoleSlots,
} from "@twobitedd/console-network";

function MyGame({ api }) {
  return (
    <>
      <ConsoleSlots.Viewport><MyCanvas /></ConsoleSlots.Viewport>
      <ConsoleSlots.Bottom><MyHud /></ConsoleSlots.Bottom>
    </>
  );
}

export const myGame = defineGameModule({
  id: "my-game",
  title: "My Game",
  version: "0.1.0",
  Component: MyGame,
});

// In your app:
<ConsoleHost module={myGame} />
```

That's the whole idea. Authors hand in a React component, the host supplies the rig.

## Documentation

The full docs live in [`docs/`](./docs/README.md):

| Topic                                                          | What's inside                                     |
|----------------------------------------------------------------|---------------------------------------------------|
| [Getting started](./docs/01-getting-started.md)                | First module from scratch in one file             |
| [Game modules](./docs/02-game-module.md)                       | The `GameModule` contract + lifecycle             |
| [Channels](./docs/03-channels.md)                              | The 5-slot design language (viewport + 4 channels)|
| [Theming](./docs/04-theming.md)                                | CSS custom properties, skinning, dark/light       |
| [Identity & chain](./docs/05-identity.md)                      | Dynamic.xyz adapter, BYO wallet/session provider  |
| [Federation](./docs/06-federation.md)                          | How many sites appear as one "unified console"    |
| [Extending the host](./docs/07-extending.md)                   | Add channels, capability flags, custom plate data |
| [Design review](./docs/08-design-review.md)                    | Proposed v0.2 → v1.0 improvements                 |
| [The registry](./docs/09-registry.md)                          | Public themes + projects, how the CDN works       |
| [Publishing a theme or project](./docs/10-publishing.md)       | 5-minute PR path to appearing in every console    |

## Connections panel

Opt-in full-screen modal that lists every project in the public registry. Turn it on by passing `connections` to `ConsoleHost`:

```jsx
<ConsoleHost
  module={myGame}
  connections={{ currentProjectId: "super-tic-tac-toe" }}
/>
```

You get a fixed "CONNECTIONS" pill in the top-right corner and a searchable, tag-filterable directory of every project anyone has registered. Your project should be in there too — [publish it](./docs/10-publishing.md).

## Status

- **v0.1** — usable today, but APIs may evolve before v1. The `GameModule` contract is the stable surface authors should rely on.
- **License** — MIT © 2026 twobitEDD

Pull requests welcome. If you're experimenting with your own console, open an issue so we can align on the spec — the whole point of the network is that your rig and mine should feel like the same device.
