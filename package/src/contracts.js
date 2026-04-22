/**
 * @file contracts.js
 *
 * Public contract for modules that plug into the Console Network.
 *
 * A "game" or "app" is a **GameModule** object. The host console renders a
 * standard holo shell (plate, lens, chin caption, power button) and exposes
 * four channels where the module can project UI:
 *
 *   - viewport  → supreme 3D/2D/video/iframe field, always visible
 *   - α (left)  → list rail, slides in from the left (e.g. matches, inventory)
 *   - β (right) → list rail, slides in from the right (e.g. crew, wallet)
 *   - modal     → center card, fades/scales in (pre-game, post-game, prompts)
 *   - hud       → bottom strip, slides up (status, directives, controls)
 *
 * A module never renders the rig itself — it exports a React component that
 * projects content into channels via the ConsoleSlots.* slot wrappers.
 */

/**
 * @typedef {Object} ConsoleIdentity
 *   Identity surface provided by the host. Implementations are expected to
 *   wrap Dynamic.xyz (or any wallet/session provider) behind this shape so
 *   modules stay provider-agnostic.
 * @property {boolean}           isAuthenticated
 * @property {string|null}       handle    Display name / ENS / email / wallet label
 * @property {string|null}       address   Primary wallet address, if any
 * @property {Record<string,*>=} extra     Provider-specific payload (escape hatch)
 * @property {() => Promise<void>=} signIn
 * @property {() => Promise<void>=} signOut
 */

/**
 * @typedef {Object} ConsoleChain
 *   Chain surface provided by the host. Kept deliberately thin; modules can
 *   either use it directly for on-chain reads/writes or opt out and bring
 *   their own client.
 * @property {number|string|null}          chainId
 * @property {(abi:*,address:string,fn:string,args?:*[]) => Promise<*>=} read
 * @property {(abi:*,address:string,fn:string,args?:*[]) => Promise<*>=} write
 * @property {(tx:string) => Promise<*>=}  waitForTx
 */

/**
 * @typedef {Object} ConsoleChannelApi
 *   Imperative handle the host gives a mounted module so it can request
 *   channel state changes (e.g. pop the outcome modal when a match ends).
 * @property {(open:boolean) => void} setLeft
 * @property {(open:boolean) => void} setRight
 * @property {(open:boolean) => void} setCenter
 * @property {(open:boolean) => void} setBottom
 * @property {(on:boolean) => void=}  setPower
 */

/**
 * @typedef {Object} ConsoleHostApi
 *   Full host surface handed to a module at mount time.
 * @property {ConsoleIdentity}                     identity
 * @property {ConsoleChain|undefined}              chain
 * @property {ConsoleChannelApi}                   channels
 * @property {(key:string, fallback?:string) => string} t   i18n resolver
 * @property {(event:string, payload?:*) => void=} emit     analytics hook
 */

/**
 * @typedef {Object} GameModule
 *   The thing every console-network game publishes.
 * @property {string} id         Stable, URL-safe id (e.g. "super-tic-tac-toe")
 * @property {string} title      Human title shown on the plate / caption
 * @property {string=} version
 * @property {{ plateId?:string, plateRev?:string, caption?:string, sticker?:string }=} plate
 *   Rig metadata. Defaults are auto-derived from `id` + `version` if omitted.
 * @property {import('react').ComponentType<{api:ConsoleHostApi}>} Component
 *   A React component authored at module scope. Receives `{ api }` as props
 *   and renders ConsoleSlots.Viewport, ConsoleSlots.Left, etc. to project
 *   content into the console's four channels.
 * @property {(api:ConsoleHostApi) => void|(() => void)=} onMount
 *   Optional side-effect hook called once when the module first mounts in a
 *   host. Useful for telemetry / preloading. May return a teardown fn.
 * @property {{ chainIds?: (number|string)[], requiresWallet?: boolean }=} requires
 *   Declarative requirements the host checks before mount.
 */

/**
 * Author-time helper for defining a module with JSDoc autocomplete intact.
 * Does not transform the object; purely a type gate.
 * @template {GameModule} T
 * @param {T} mod
 * @returns {T}
 */
export function defineGameModule(mod) {
  if (!mod || typeof mod !== "object") {
    throw new Error("[console-network] defineGameModule: module must be an object");
  }
  if (!mod.id || typeof mod.id !== "string") {
    throw new Error("[console-network] defineGameModule: `id` is required");
  }
  if (!mod.title || typeof mod.title !== "string") {
    throw new Error("[console-network] defineGameModule: `title` is required");
  }
  if (typeof mod.Component !== "function") {
    throw new Error("[console-network] defineGameModule: `Component` must be a React component");
  }
  return mod;
}

/**
 * Derive sensible default rig metadata from a module.
 * @param {GameModule} mod
 */
export function derivePlate(mod) {
  const id = mod.id.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 18);
  return {
    plateId: mod.plate?.plateId ?? id,
    plateRev: mod.plate?.plateRev ?? (mod.version ? `REV ${mod.version}` : "REV 0.1"),
    caption: mod.plate?.caption ?? mod.title,
    sticker: mod.plate?.sticker ?? null,
  };
}
