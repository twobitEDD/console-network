/**
 * Helpers for stable `ConsoleIdentity` handling (see contracts.js).
 *
 * The host compares primitive identity fields so a fresh object each render with
 * the same session does not churn `api` / `module.onMount`.
 */

/** @type {import('./contracts.js').ConsoleIdentity} */
export const DEFAULT_CONSOLE_IDENTITY = Object.freeze({
  isAuthenticated: false,
  handle: null,
  address: null,
});

/**
 * Normalizes identity input into a plain object suitable for `useMemo` deps.
 * Games should still memoize the object they pass when possible so `extra` /
 * callback references stay stable.
 *
 * @param {import('./contracts.js').ConsoleIdentity | undefined | null} identity
 * @returns {import('./contracts.js').ConsoleIdentity}
 */
export function pickConsoleIdentityFields(identity) {
  const i = identity ?? {};
  return {
    isAuthenticated: Boolean(i.isAuthenticated),
    handle: i.handle ?? null,
    address: i.address ?? null,
    extra: i.extra,
    signIn: i.signIn,
    signOut: i.signOut,
  };
}
