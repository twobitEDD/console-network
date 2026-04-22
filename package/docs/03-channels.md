# Channels — the 5-slot design language

Every module addresses five slots. That grammar is the design language the network shares: a user who learns one console can walk into any other and already know where to look.

| Slot       | Frame     | Motion                 | Purpose                                         |
|------------|-----------|------------------------|-------------------------------------------------|
| `Viewport` | —         | Always visible         | Game field, canvas, video, iframe, XR stage     |
| `Left` (α) | Frame 1 🟥 | Slide in from left     | List rail: matches, inventory, chats            |
| `Right` (β)| Frame 2 🟥 | Slide in from right    | List rail: crew/identity, wallet, notifications |
| `Center`   | Frame 3 🟪 | Scale + fade in        | MODAL: pre-game, post-game, prompts, dialogs    |
| `Bottom`   | Frame 4 🟩 | Slide up from chin     | HUD: status, directives, keyboard, live inputs  |

## The "viewport is supreme" principle

- The viewport is the only slot that's always on-screen.
- Anything a user needs to look at *while playing* belongs on the viewport, not in a channel.
- Channels are **overlays**. They live on top of the viewport, inside the lens, and the user can dismiss them without losing the game.

## When to use which channel

### α (Left) — list rail
- Anything browsable: open matches, friends list, achievements log, shop categories.
- One vertical list, scroll overflow is fine.
- **Don't** put primary actions here — the user can close it.

### β (Right) — list rail
- Identity-adjacent surfaces: who you are, what wallet you're using, what chain you're on, notifications, DMs.
- Symmetric with α; the two rails are peers.

### Center — MODAL
- Only one of these should be open at a time. The host assumes it.
- Pre-game card ("Start a match?") and post-game outcome ("You won. Play again?") are the canonical uses.
- Blocks the viewport's interactions while open, by design.

### Bottom — HUD
- The default "always useful" channel; opens by default, expected to be mostly-visible.
- Current turn / score / timer, directive line, quick-access controls (reset, mute).
- If you need a virtual keyboard or controller, this is where it lives.

## Opening and closing

### Imperatively from inside your module

```jsx
api.channels.setCenter(true);   // open the MODAL
api.channels.setLeft(false);    // collapse α
```

### Declaratively by rendering (or not rendering) a slot

Channels don't open just because you rendered a slot — the host still tracks open/closed state. But if a slot has no children, you can hide it entirely by not rendering the wrapper at all.

```jsx
{gameOver && (
  <ConsoleSlots.Center>
    <Outcome … />
  </ConsoleSlots.Center>
)}
```

## Motion contract

Authors can rely on these animations being consistent across the network:

- **Left/Right rails**: horizontal translate, 440ms cubic ease. Dismissed state = off-screen by 100% + 12px gap.
- **Center MODAL**: scale 0.94 → 1 + opacity fade, 340ms. Dismissed state non-interactive.
- **Bottom HUD**: translate-Y from 100% off-screen, same timing.
- All respect `prefers-reduced-motion`.

## Don't reinvent

- Don't build your own drawer/modal/toast inside the viewport — use the corresponding channel.
- Don't fight the grammar: a "settings gear" in the corner of the viewport is a cheap win but breaks the shared design language. Prefer a `β` rail entry.

## Extending with new channels

The core spec is five slots. If you need more (a top banner, a corner sticker, an overlay chat), see [Extending the host](./07-extending.md) for how to add slots without breaking the grammar.
