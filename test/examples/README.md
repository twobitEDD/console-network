# examples/

Read these in order. Each file is the smallest code that illustrates one step.

1. [`01-define-module.jsx`](./01-define-module.jsx) — the tiniest valid `GameModule`.
2. [`02-four-channels.jsx`](./02-four-channels.jsx) — same module expanded to project into **every** slot.
3. [`03-mount.jsx`](./03-mount.jsx) — how your app wires a module into a `<ConsoleHost/>`.
4. [`04-connections.jsx`](./04-connections.jsx) — two ways to surface the `ConnectionsPanel` (host-level prop vs. custom trigger).

These files are **not executed** by the test runner. They're reference code. If they stop compiling in your IDE after a library change, something broke the public contract.
