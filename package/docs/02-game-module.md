# Game modules

A **game module** is a plain object that describes one experience on the network. It's the *only* thing module authors write.

## Shape

```ts
type GameModule = {
  id: string;                              // url-safe unique id
  title: string;                           // shown on the plate / caption
  version?: string;

  // Cosmetic overrides — defaults derive from id/version
  plate?: {
    plateId?: string;
    plateRev?: string;
    caption?: string;
    sticker?: string;
  };

  // Capability flags — host can gate mount on these
  requires?: {
    chainIds?: (number | string)[];
    requiresWallet?: boolean;
  };

  // The work of the module
  Component: React.ComponentType<{ api: ConsoleHostApi }>;

  // Optional side-effect lifecycle
  onMount?: (api: ConsoleHostApi) => void | (() => void);
};
```

Define one with `defineGameModule(...)` — it's a no-op at runtime except for validating required fields, but gives JSDoc autocomplete:

```jsx
export const myGame = defineGameModule({
  id: "super-tic-tac-toe",
  title: "Super Tic-Tac-Toe",
  version: "1.0.0",
  plate: { sticker: "α" },
  Component: MyGame,
});
```

## The `api` the host hands to your component

```ts
type ConsoleHostApi = {
  identity: ConsoleIdentity;                 // see identity doc
  chain?: ConsoleChain;                      // optional chain surface
  channels: {                                // imperative channel control
    setLeft(open: boolean): void;
    setRight(open: boolean): void;
    setCenter(open: boolean): void;
    setBottom(open: boolean): void;
    setPower(on: boolean): void;
  };
  t(key: string, fallback?: string): string; // i18n resolver
  emit?(event: string, payload?: unknown): void;
};
```

The `api` object is stable across renders as long as its inputs don't change. You can pass it freely into child components without wrapping in `useMemo`.

## Lifecycle

1. **Host mounts** your module's `Component`. You render slot wrappers.
2. Host collects the slot children into the 5 channels and renders the rig.
3. **On unmount** (route change, module swap), teardown fires. If you registered `onMount`, its returned function is invoked.

There is **no special init path** for module state — use React hooks. If you need to preload / fetch something the moment the module lands, use `useEffect` in `Component` or `onMount` on the module object (which runs once per host instance).

## Rules of thumb

- **The module never renders the rig.** It only projects into slots.
- **The module doesn't own identity.** It reads `api.identity.*`; it never bundles its own wallet connector.
- **Keep the viewport supreme.** Game-critical UI goes on the board, not in an overlay.
- **Treat channels as overlays.** Anything the user can ignore while playing belongs in a channel.
- **Close channels when done.** If your MODAL answered a question, `api.channels.setCenter(false)`.

## Example: the Super Tic-Tac-Toe module sketch

```jsx
function SuperTicTacToe({ api }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (state.winner) api.channels.setCenter(true);
  }, [state.winner, api]);

  return (
    <>
      <ConsoleSlots.Viewport>
        <Board3D state={state} onMove={(m) => dispatch({ type: "play", m })} />
      </ConsoleSlots.Viewport>

      <ConsoleSlots.Left>
        <MatchList />
      </ConsoleSlots.Left>

      <ConsoleSlots.Right>
        <CrewPanel identity={api.identity} />
      </ConsoleSlots.Right>

      <ConsoleSlots.Bottom>
        <Hud state={state} onReset={() => dispatch({ type: "reset" })} />
      </ConsoleSlots.Bottom>

      {state.winner && (
        <ConsoleSlots.Center>
          <Outcome
            winner={state.winner}
            onReplay={() => {
              dispatch({ type: "reset" });
              api.channels.setCenter(false);
            }}
          />
        </ConsoleSlots.Center>
      )}
    </>
  );
}

export const superTicTacToe = defineGameModule({
  id: "super-tic-tac-toe",
  title: "Super Tic-Tac-Toe",
  version: "1.0.0",
  Component: SuperTicTacToe,
  requires: { requiresWallet: false },
});
```
