import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import HoloFrameConsole from "./HoloFrameConsole.jsx";
import { useConsoleChannels } from "./useConsoleChannels.js";
import { derivePlate } from "./contracts.js";
import { ConsoleSlotProvider } from "./ConsoleSlots.jsx";
import ConnectionsPanel from "./ConnectionsPanel.jsx";
import { createConsoleSlotStore } from "./consoleSlotStore.js";
import { pickConsoleIdentityFields } from "./consoleIdentity.js";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.js";
import { isConsoleNetworkDev, warnModuleReferenceChanged } from "./consoleHostDebug.js";

const EMPTY_LABELS = Object.freeze({});

/**
 * <ConsoleHost/>
 *
 * Mounts a **GameModule** (see `contracts.js`) into the standard holo shell and wires the
 * four-channel overlay system. Consumers typically render exactly one
 * ConsoleHost per route, passing the module + an identity/chain bridge.
 *
 * The host owns rig chrome + channel state; the module owns its content. A
 * module's `mount(api)` must return a React component which renders slot
 * elements (`<ConsoleSlots.Viewport/>`, `<ConsoleSlots.Left/>`, ...) to
 * project content into each channel.
 *
 * **Identity:** `api.identity` is derived from `isAuthenticated`, `handle`,
 * and `address` so a new object each render with the same session does not
 * recreate `api`. Memoize `identity` in your app (and stable `signIn` /
 * `signOut` refs) to avoid churn on `extra` and callbacks.
 *
 * **Motion:** `effects="lite"` disables lens parallax and short-circuits most
 * chrome transitions. With `effects="full"` (default), OS reduced motion is
 * honored unless `respectReducedMotion={false}`.
 *
 * **Debug:** `debug` logs reference churn in development (`NODE_ENV !==
 * "production"`). Pair with [@welldone-software/why-did-you-render](https://github.com/welldone-software/why-did-you-render)
 * in your app for deeper renders.
 *
 * @param {{
 *   module: import('./contracts.js').GameModule,
 *   identity?: import('./contracts.js').ConsoleIdentity,
 *   chain?: import('./contracts.js').ConsoleChain,
 *   t?: (key:string, fallback?:string) => string,
 *   emit?: (event:string, payload?:*) => void,
 *   initialChannels?: { left?:boolean, right?:boolean, center?:boolean, bottom?:boolean },
 *   labels?: Partial<{
 *     engage:string, standby:string,
 *     leftToggle:string, rightToggle:string, centerToggle:string, bottomToggle:string,
 *     leftToggleAria:string, rightToggleAria:string, centerToggleAria:string, bottomToggleAria:string,
 *     rigAria:string,
 *   }>,
 *   connections?: boolean | { currentProjectId?: string, registryUrl?: string, label?: string },
 *   effects?: 'full' | 'lite',
 *   respectReducedMotion?: boolean,
 *   debug?: boolean,
 * }} props
 */
export default function ConsoleHost({
  module,
  identity,
  chain,
  t,
  emit,
  initialChannels,
  labels = EMPTY_LABELS,
  connections = false,
  effects = "full",
  respectReducedMotion = true,
  debug = false,
}) {
  const connectionsConfig = connections === true ? {} : connections || null;
  const prefersReduced = usePrefersReducedMotion();

  const motionReduced =
    effects === "lite" ||
    (effects === "full" && respectReducedMotion && prefersReduced);

  const forceFullMotionCss = effects === "full" && !respectReducedMotion;

  /* eslint-disable react-hooks/exhaustive-deps --
     Omit noisy wrapper refs (`module`, `identity`, `chain`) when deps listed capture semantics */
  const plate = useMemo(
    () => derivePlate(module),
    [
      module.id,
      module.version,
      module.title,
      module.plate?.plateId,
      module.plate?.plateRev,
      module.plate?.caption,
      module.plate?.sticker,
    ],
  );

  const channels = useConsoleChannels(initialChannels);
  const translate = useMemo(() => t ?? ((_k, f) => f ?? _k), [t]);

  const stableIdentity = useMemo(() => pickConsoleIdentityFields(identity), [
    identity?.isAuthenticated,
    identity?.handle,
    identity?.address,
    identity?.extra,
    identity?.signIn,
    identity?.signOut,
  ]);

  const chainId = chain?.chainId ?? null;
  const stableChain = useMemo(
    () => chain,
    [
      chainId,
      chain?.read,
      chain?.write,
      chain?.waitForTx,
    ],
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  const api = useMemo(
    () => ({
      identity: stableIdentity,
      chain: stableChain,
      channels: channels.api,
      t: translate,
      emit,
    }),
    [stableIdentity, stableChain, channels.api, translate, emit],
  );

  const apiRef = useRef(api);

  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  const [connectionsOpen, setConnectionsOpen] = useState(false);

  const [slotStore] = useState(() => createConsoleSlotStore());

  const register = useCallback((channel, key, node) => {
    slotStore.register(channel, key, node);
  }, [slotStore]);

  const unregister = useCallback((channel, key) => {
    slotStore.unregister(channel, key);
  }, [slotStore]);

  const ModuleComponent = module.Component;

  useEffect(() => {
    if (typeof module.onMount !== "function") return undefined;
    const teardown = module.onMount(apiRef.current);
    return typeof teardown === "function" ? teardown : undefined;
  }, [module.id]); /* eslint-disable-line react-hooks/exhaustive-deps -- keyed by module.id; apiRef stays current */

  const prevModuleRef = useRef(module);
  useEffect(() => {
    if (!debug || !isConsoleNetworkDev()) return;
    if (prevModuleRef.current !== module) {
      warnModuleReferenceChanged(prevModuleRef.current, module);
      prevModuleRef.current = module;
    }
  }, [debug, module]);

  useEffect(() => {
    if (!debug || !isConsoleNetworkDev()) return;
    console.debug("[@twobitedd/console-network] ConsoleHost identity", {
      moduleId: module.id,
      identity: stableIdentity,
    });
  }, [debug, module.id, stableIdentity]);

  const { state, set } = channels;

  const channelBridge = useMemo(() => ({ state, set }), [state, set]);

  const connectionsLabel = connectionsConfig?.label
    ?? translate("consoleNetwork.connections", "CONNECTIONS");

  return (
    <ConsoleSlotProvider register={register} unregister={unregister}>
      <ModuleComponent key={module.id} api={api} />
      {connectionsConfig && (
        <>
          <button
            type="button"
            className="holo-connections-trigger"
            onClick={() => setConnectionsOpen(true)}
            aria-label={connectionsLabel}
          >
            <span className="holo-connections-trigger__dot" aria-hidden="true" />
            <span className="holo-connections-trigger__label">{connectionsLabel}</span>
          </button>
          <ConnectionsPanel
            open={connectionsOpen}
            onClose={() => setConnectionsOpen(false)}
            registryUrl={connectionsConfig.registryUrl}
            currentProjectId={connectionsConfig.currentProjectId ?? module.id}
          />
        </>
      )}
      <MemoHoloShellFromSlots
        slotStore={slotStore}
        plate={plate}
        labels={labels}
        translate={translate}
        channels={channelBridge}
        motionReduced={motionReduced}
        forceFullMotionCss={forceFullMotionCss}
      />
    </ConsoleSlotProvider>
  );
}

const MemoHoloShellFromSlots = memo(HoloShellFromSlots);
MemoHoloShellFromSlots.displayName = "HoloShellFromSlots";

/** Subscribes to slot mutations without forcing ConsoleHost (or the module) to re-render. */
function HoloShellFromSlots({
  slotStore,
  plate,
  labels,
  translate,
  channels: { state, set },
  motionReduced,
  forceFullMotionCss,
}) {
  const slots = useSyncExternalStore(
    slotStore.subscribe,
    slotStore.getSnapshot,
    slotStore.getSnapshot,
  );

  const renderChannel = (channel) => {
    const entries = slots[channel];
    if (!entries) return null;
    const values = Object.values(entries);
    return values.length ? values : null;
  };

  return (
    <HoloFrameConsole
      motionReduced={motionReduced}
      forceFullMotionCss={forceFullMotionCss}
      plateId={plate.plateId}
      plateRev={plate.plateRev}
      caption={plate.caption}
      sticker={plate.sticker}
      rigAria={labels.rigAria ?? translate("consoleNetwork.rigAria", plate.caption)}
      viewport={renderChannel("viewport")}
      leftChannel={renderChannel("left")}
      rightChannel={renderChannel("right")}
      centerChannel={renderChannel("center")}
      bottomChannel={renderChannel("bottom")}
      displayOn={state.power}
      onDisplayToggle={(next) => set.setPower(next)}
      engageLabel={labels.engage ?? translate("consoleNetwork.engage", "ENGAGE")}
      standbyLabel={labels.standby ?? translate("consoleNetwork.standby", "STANDBY")}
      leftToggleLabel={labels.leftToggle ?? translate("consoleNetwork.leftToggle", "α")}
      rightToggleLabel={labels.rightToggle ?? translate("consoleNetwork.rightToggle", "β")}
      centerToggleLabel={labels.centerToggle ?? translate("consoleNetwork.centerToggle", "MODAL")}
      bottomToggleLabel={labels.bottomToggle ?? translate("consoleNetwork.bottomToggle", "HUD")}
      leftToggleAria={labels.leftToggleAria ?? "Toggle α rail"}
      rightToggleAria={labels.rightToggleAria ?? "Toggle β rail"}
      centerToggleAria={labels.centerToggleAria ?? "Toggle center modal"}
      bottomToggleAria={labels.bottomToggleAria ?? "Toggle HUD"}
      leftOpen={state.leftOpen}
      onLeftOpenChange={(next) => set.setLeft(next)}
      rightOpen={state.rightOpen}
      onRightOpenChange={(next) => set.setRight(next)}
      centerOpen={state.centerOpen}
      onCenterOpenChange={(next) => set.setCenter(next)}
      bottomOpen={state.bottomOpen}
      onBottomOpenChange={(next) => set.setBottom(next)}
    />
  );
}
