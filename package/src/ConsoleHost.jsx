import { useCallback, useEffect, useMemo, useState } from "react";
import HoloFrameConsole from "./HoloFrameConsole.jsx";
import { useConsoleChannels } from "./useConsoleChannels.js";
import { derivePlate } from "./contracts.js";
import { ConsoleSlotProvider } from "./ConsoleSlots.jsx";
import ConnectionsPanel from "./ConnectionsPanel.jsx";

const EMPTY_SLOTS = Object.freeze({
  viewport: {},
  left: {},
  right: {},
  center: {},
  bottom: {},
});

/**
 * <ConsoleHost/>
 *
 * Mounts a {@link GameModule} into the standard holo shell and wires the
 * four-channel overlay system. Consumers typically render exactly one
 * ConsoleHost per route, passing the module + an identity/chain bridge.
 *
 * The host owns rig chrome + channel state; the module owns its content. A
 * module's `mount(api)` must return a React component which renders slot
 * elements (`<ConsoleSlots.Viewport/>`, `<ConsoleSlots.Left/>`, ...) to
 * project content into each channel.
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
 * }} props
 */
export default function ConsoleHost({
  module,
  identity,
  chain,
  t,
  emit,
  initialChannels,
  labels = {},
  /**
   * Enable the built-in Connections panel.
   *   false (default) — no trigger, no panel rendered
   *   true            — trigger + panel, uses the public registry, no current-id
   *   { currentProjectId?: string, registryUrl?: string, label?: string }
   */
  connections = false,
}) {
  const connectionsConfig = connections === true ? {} : connections || null;
  const plate = useMemo(() => derivePlate(module), [module]);
  const channels = useConsoleChannels(initialChannels);
  const translate = useMemo(() => t ?? ((_k, f) => f ?? _k), [t]);

  const api = useMemo(
    () => ({
      identity: identity ?? { isAuthenticated: false, handle: null, address: null },
      chain,
      channels: channels.api,
      t: translate,
      emit,
    }),
    [identity, chain, channels.api, translate, emit],
  );

  const [slots, setSlots] = useState(EMPTY_SLOTS);
  const [connectionsOpen, setConnectionsOpen] = useState(false);

  const register = useCallback((channel, key, node) => {
    setSlots((prev) => {
      const prevChannel = prev[channel] ?? {};
      if (prevChannel[key] === node) return prev;
      return { ...prev, [channel]: { ...prevChannel, [key]: node } };
    });
  }, []);
  const unregister = useCallback((channel, key) => {
    setSlots((prev) => {
      const prevChannel = prev[channel];
      if (!prevChannel || !(key in prevChannel)) return prev;
      const nextChannel = { ...prevChannel };
      delete nextChannel[key];
      return { ...prev, [channel]: nextChannel };
    });
  }, []);

  const ModuleComponent = module.Component;

  useEffect(() => {
    if (typeof module.onMount !== "function") return undefined;
    const teardown = module.onMount(api);
    return typeof teardown === "function" ? teardown : undefined;
  }, [module, api]);

  const renderChannel = (channel) => {
    const entries = slots[channel];
    if (!entries) return null;
    const values = Object.values(entries);
    return values.length ? values : null;
  };

  const { state, set } = channels;

  const connectionsLabel = connectionsConfig?.label
    ?? translate("consoleNetwork.connections", "CONNECTIONS");

  return (
    <ConsoleSlotProvider register={register} unregister={unregister}>
      <ModuleComponent api={api} />
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
      <HoloFrameConsole
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
    </ConsoleSlotProvider>
  );
}
