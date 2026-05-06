# Identity & chain

The console is provider-agnostic on purpose: Dynamic today, Privy tomorrow, bare `wagmi` next year. Modules never see the provider — only a normalized surface.

## The `ConsoleIdentity` contract

```ts
interface ConsoleIdentity {
  isAuthenticated: boolean;
  handle:   string | null;       // display name / ENS / email / shortened address
  address:  string | null;       // primary wallet address (if any)
  extra?:   Record<string, unknown>;  // provider-specific escape hatch
  signIn?():  Promise<void>;
  signOut?(): Promise<void>;
}
```

Modules only read these fields; they should never inspect `extra` unless they *require* a specific provider (in which case they should declare it via `requires`).

## Stable identity references

`<ConsoleHost>` rebuilds `api.identity` with **`pickConsoleIdentityFields`** so the **same session** does not produce a new `api` object just because your wallet hook returned a fresh object literal (`isAuthenticated` / `handle` / `address` compared by value).

You should still **memoize** the object you pass when you can — especially `extra`, `signIn`, and `signOut`, which are compared by reference:

```jsx
const identity = useMemo(
  () => ({
    isAuthenticated,
    handle,
    address,
    extra: dynamicPayload,
    signIn,
    signOut,
  }),
  [isAuthenticated, handle, address, dynamicPayload, signIn, signOut],
);

return <ConsoleHost module={myGame} identity={identity} />;
```

Guest defaults are available as `DEFAULT_CONSOLE_IDENTITY` if you need a stable frozen sentinel elsewhere.

For debugging churn in development, pass **`debug`** on `<ConsoleHost>` (`NODE_ENV !== "production"`) and optionally add [**why-did-you-render**](https://github.com/welldone-software/why-did-you-render) to your app.

Heavy modules can wrap their root component in **`React.memo`** when `api` is stable enough that only local slot state should re-render.

## Built-in Dynamic.xyz adapter

Dynamic is supported out of the box because the reference host uses it. The package doesn't depend on Dynamic's SDK — you provide the context, the adapter normalizes it:

```jsx
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ConsoleHost, identityFromDynamic } from "@twobitedd/console-network";

function Route() {
  const dynamic = useDynamicContext();
  const identity = identityFromDynamic(dynamic);
  return <ConsoleHost module={myGame} identity={identity} />;
}
```

`identityFromDynamic` handles:

- `isAuthenticated` ← presence of `user`
- `handle` ← `user.alias || user.username || user.email || shortened address`
- `address` ← `primaryWallet.address` with fallback to the first verified credential
- `signIn` / `signOut` ← wrappers over `setShowAuthFlow(true)` / `handleLogOut()`

## BYO provider

Any provider works. Wrap it in a shape matching `ConsoleIdentity`:

```jsx
function identityFromPrivy(privy) {
  return {
    isAuthenticated: privy.authenticated,
    handle: privy.user?.email?.address ?? privy.user?.wallet?.address?.slice(0, 8),
    address: privy.user?.wallet?.address ?? null,
    extra: { user: privy.user },
    signIn: () => privy.login(),
    signOut: () => privy.logout(),
  };
}
```

Or skip it entirely for offline/demo mode:

```jsx
<ConsoleHost
  module={myGame}
  identity={{ isAuthenticated: false, handle: "guest", address: null }}
/>
```

## Chain surface

`ConsoleChain` is deliberately thin — if the module wants more, it can bring its own client.

```ts
interface ConsoleChain {
  chainId: number | string | null;
  read?(abi: unknown, address: string, fn: string, args?: unknown[]): Promise<unknown>;
  write?(abi: unknown, address: string, fn: string, args?: unknown[]): Promise<unknown>;
  waitForTx?(tx: string): Promise<unknown>;
}
```

The reference host wires this against `viem` / `wagmi` and exposes `read`/`write`/`waitForTx`. A more minimal host can pass `undefined` and modules that declared `requires.chainIds` will be gated before mount by the host's capability check.

## Capability gating (host side)

The host should honor `module.requires` before rendering the component:

```jsx
if (module.requires?.requiresWallet && !identity.isAuthenticated) {
  return <SignInPrompt onSignIn={identity.signIn} />;
}
if (module.requires?.chainIds && !module.requires.chainIds.includes(chain?.chainId)) {
  return <WrongChainPrompt target={module.requires.chainIds} />;
}
return <ConsoleHost module={module} identity={identity} chain={chain} />;
```

A built-in `<ConsoleRouter>` that does this automatically is on the roadmap.

## Identity portability

If every host uses wallet address as identity, users carry their persona between consoles. A match they finished on `console-a.example` can be referenced by its on-chain match id from `console-b.example` without re-login.

This is the point of picking a thin contract: the only thing the network promises is that `api.identity.address` is the user's wallet. Everything else a module cares about is either on-chain or a provider concern.
