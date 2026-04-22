# console-network-demo

Minimal Vite + React app that mounts `@twobitedd/console-network` and drives all four channels plus the viewport. Useful as:

- a smoke test after changes to the package
- a reference "starter" another author can copy
- a fixture for the eventual `console-testkit`

## Run it

From the repo root (npm workspaces are already wired up):

```bash
npm install
npm run build:console          # build the library once
npm --workspace console-network-demo run dev
```

Vite opens at <http://localhost:5173>. If the library ever changes, re-run `npm run build:console` (or `npm run dev:console` for watch mode).

## What you should see / test

| Panel         | What to verify                                                   |
|---------------|------------------------------------------------------------------|
| **Viewport**  | Big `CONSOLE · NETWORK` title + blue `tap` button with counter   |
| **α (left)**  | Red-framed rail with 6 match entries, clicking one highlights it |
| **β (right)** | Red-framed rail with identity KV + a `sign in` toggle            |
| **MODAL**     | Pink center card with close + reset buttons                      |
| **HUD**       | Green bottom bar showing live count / last event + open buttons  |

Toggle buttons in the HUD open/close each channel. The footer toggles (`α · β · MODAL · HUD`) are driven by the host. The `STANDBY / ENGAGE` button on the right of the footer powers the viewport off/on — every channel dims with it.

## Files

```
examples/demo/
  package.json          — workspace package, deps the lib via "*"
  vite.config.js
  index.html
  README.md
  src/
    main.jsx            — imports styles.css + renders <App/>
    App.jsx             — <ConsoleHost module={demoModule} />
    demoModule.jsx      — the GameModule: viewport + 4 channels
```

## Notes for the curious

- The demo does NOT wire Dynamic.xyz. The `β` rail simulates sign-in/out in
  local state just to exercise identity-ish UI. To wire the real adapter,
  see [`../console-network/docs/05-identity.md`](../console-network/docs/05-identity.md).
- All inline styles live alongside the JSX on purpose — we're showcasing the
  package, not a styling approach. Real modules should use whatever stack
  they prefer (CSS modules, Tailwind, styled-components, etc.).
