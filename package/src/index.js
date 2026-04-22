export { default as HoloFrameConsole } from "./HoloFrameConsole.jsx";
export { default as ConsoleHost } from "./ConsoleHost.jsx";
export {
  ConsoleSlotProvider,
  ViewportSlot,
  LeftSlot,
  RightSlot,
  CenterSlot,
  BottomSlot,
} from "./ConsoleSlots.jsx";
export { useConsoleChannels } from "./useConsoleChannels.js";
export { defineGameModule, derivePlate } from "./contracts.js";
export { identityFromDynamic } from "./dynamic.js";
export { default as ConnectionsPanel } from "./ConnectionsPanel.jsx";
export {
  DEFAULT_REGISTRY_URL,
  fetchRegistry,
  matchProject,
  collectTags,
} from "./registry.js";

import {
  ViewportSlot,
  LeftSlot,
  RightSlot,
  CenterSlot,
  BottomSlot,
} from "./ConsoleSlots.jsx";

/**
 * Namespace aggregator for ergonomics:
 *
 *   import { ConsoleSlots } from "@twobitedd/console-network";
 *   <ConsoleSlots.Viewport>…</ConsoleSlots.Viewport>
 */
export const ConsoleSlots = {
  Viewport: ViewportSlot,
  Left: LeftSlot,
  Right: RightSlot,
  Center: CenterSlot,
  Bottom: BottomSlot,
};
