# test/

Smoke tests for `@twobitedd/console-network` that double as documentation: every file here is both an **executable test** and a **minimal usage example** of one aspect of the library.

No frameworks, no `vitest`, no React test harness. Uses only Node's built-in `node:test` runner so anyone cloning the repo can run it with nothing but `node`.

## Run

Build the library first (the tests import from `dist/`), then run:

```bash
npm run build:console
npm test --workspace=@twobitedd/console-network      # or:
node --test test/*.test.mjs
```

Or just call the root convenience:

```bash
npm run test:network
```

Expected output:

```
▶ exports
  ✔ exposes the documented public surface
  ✔ all helpers are functions, all components are functions
▶ defineGameModule
  ✔ accepts a valid module
  ✔ rejects missing id
  ✔ rejects missing title
  ✔ rejects non-function Component
  ✔ is a pure pass-through (returns the same object reference)
▶ derivePlate
  ✔ derives plateId from the module id
  ✔ uses version to compose plateRev
  ✔ caption falls back to title
  ✔ overrides from module.plate win
▶ identityFromDynamic
  ✔ handles an empty context
  ✔ extracts handle from alias
  ✔ falls back to a shortened address
…
```

## What each file shows

| File                           | Aspect tested                                        | Read it like…                          |
|--------------------------------|------------------------------------------------------|----------------------------------------|
| `exports.test.mjs`             | The package's public API shape                       | "what imports are available"           |
| `contracts.test.mjs`           | `defineGameModule`, `derivePlate`                    | "how module authoring works"           |
| `dynamic.test.mjs`             | `identityFromDynamic` normalization                  | "how to bridge any wallet provider"    |
| `registry.test.mjs`            | Every manifest in `registry/` validates + index.json is fresh | "PR gate before CI confirms it"   |
| `examples/01-define-module.jsx`| The smallest possible `GameModule`                   | copy-paste starter                      |
| `examples/02-four-channels.jsx`| A module that projects into every slot               | channel grammar in practice             |
| `examples/03-mount.jsx`        | `<ConsoleHost module={…}/>` at the app level         | where you wire it into your app        |
| `examples/04-connections.jsx`  | Built-in `ConnectionsPanel` — host-level and custom  | how the network surfaces itself        |

## Not covered here

- **Live rendering of `HoloFrameConsole` / `ConsoleHost`.** That's validated interactively by [`examples/demo`](../examples/demo/) — run `npm run dev:demo` and click through all four channels.
- **`useConsoleChannels` hook behavior.** Exercised transitively by the demo; a dedicated React-rendering test suite is on the v0.2 roadmap (see `package/docs/08-design-review.md` "Testing kit").

## Adding a test

1. Drop a new `something.test.mjs` in this directory.
2. Import from `@twobitedd/console-network` (it resolves through workspaces).
3. Use `node:test` (`import { test, describe } from "node:test"`) and `node:assert/strict`.

That's it. No config, no plugins.
