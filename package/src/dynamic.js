/**
 * Optional Dynamic.xyz → ConsoleIdentity adapter.
 *
 * The package deliberately does NOT import `@dynamic-labs/sdk-react-core` so
 * it can stay a thin dependency. Consumers pass the live Dynamic context in
 * and get back a normalized {@link ConsoleIdentity} they can hand to
 * <ConsoleHost/>.
 *
 * Typical wire-up inside a host app (pseudocode):
 *
 *   import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
 *   import { identityFromDynamic } from "@twobitedd/console-network";
 *
 *   function ArcadeRoute() {
 *     const dynamic = useDynamicContext();
 *     const identity = identityFromDynamic(dynamic);
 *     return <ConsoleHost module={myGame} identity={identity} />;
 *   }
 */

/**
 * @param {*} ctx  The raw return value of Dynamic's useDynamicContext()
 * @returns {import('./contracts.js').ConsoleIdentity}
 */
export function identityFromDynamic(ctx) {
  const user = ctx?.user ?? null;
  const primaryWallet = ctx?.primaryWallet ?? null;
  const address = primaryWallet?.address ?? user?.verifiedCredentials?.find?.((c) => c?.address)?.address ?? null;
  const handle =
    user?.alias ||
    user?.username ||
    user?.email ||
    (address ? shortenAddress(address) : null);

  return {
    isAuthenticated: Boolean(user),
    handle,
    address,
    extra: { user, primaryWallet },
    signIn: async () => { await ctx?.setShowAuthFlow?.(true); },
    signOut: async () => { await ctx?.handleLogOut?.(); },
  };
}

function shortenAddress(addr) {
  if (!addr || typeof addr !== "string") return null;
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
