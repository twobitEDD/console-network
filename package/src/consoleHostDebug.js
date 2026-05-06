/**
 * Dev-only helpers for ConsoleHost diagnostics (reference churn).
 * Stripped in production when bundlers honor NODE_ENV.
 */

/** @returns {boolean} */
export function isConsoleNetworkDev() {
  return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
}

/**
 * @param {*} prev
 * @param {*} next
 */
export function warnModuleReferenceChanged(prev, next) {
  if (!isConsoleNetworkDev()) return;
  console.warn("[@twobitedd/console-network] `module` object reference changed", {
    moduleId: next?.id,
    sameLogicalModule: prev?.id === next?.id,
  });
}
