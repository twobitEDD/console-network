# Console Network docs

A small set of focused guides. Start with **Getting started** if you just want to ship a module; skip to **Federation** if you want to stand up your own console and plug into the wider network.

1. [Getting started](./01-getting-started.md) — first module in one file
2. [Game modules](./02-game-module.md) — the author-facing contract
3. [Channels](./03-channels.md) — the 5-slot design language
4. [Theming](./04-theming.md) — CSS custom properties, re-skinning
5. [Identity & chain](./05-identity.md) — Dynamic.xyz + BYO adapters
6. [Federation](./06-federation.md) — unified "console" across independent sites
7. [Extending the host](./07-extending.md) — add slots, capabilities, plate telemetry
8. [Design review](./08-design-review.md) — proposed improvements on the road to v1

The docs assume you've already done:

```bash
npm install @twobitedd/console-network react react-dom
```

```js
import "@twobitedd/console-network/styles.css";
```

If a doc here ever disagrees with the `README.md` in the package root, the docs win.
