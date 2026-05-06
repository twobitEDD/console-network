import { createContext, useContext, useId, useLayoutEffect, useMemo, useRef } from "react";

/**
 * Slot-registration system. Modules project content into overlay channels (viewport,
 * α / β / modal / HUD, plus optional salvage-rail slots) by rendering
 * `<ConsoleSlots.Viewport/>`, `<ConsoleSlots.Left/>`, etc. The host collects them via context.
 *
 *   function MyGame({ api }) {
 *     return (
 *       <>
 *         <ConsoleSlots.Viewport><MyCanvas /></ConsoleSlots.Viewport>
 *         <ConsoleSlots.Bottom><MyHud /></ConsoleSlots.Bottom>
 *         {showOutcome && <ConsoleSlots.Center><Outcome /></ConsoleSlots.Center>}
 *       </>
 *     );
 *   }
 */

/** @type {import('react').Context<null | { register:(channel:string,key:string,node:import('react').ReactNode)=>void, unregister:(channel:string,key:string)=>void }>} */
const SlotContext = createContext(null);

export function ConsoleSlotProvider({ register, unregister, children }) {
  const value = useMemo(() => ({ register, unregister }), [register, unregister]);
  return (
    <SlotContext.Provider value={value}>
      {children}
    </SlotContext.Provider>
  );
}

function useSlot(channel, node) {
  const ctx = useContext(SlotContext);
  const key = useId();
  const nodeRef = useRef(node);

  useLayoutEffect(() => {
    nodeRef.current = node;
  }, [node]);

  useLayoutEffect(() => {
    if (!ctx) return undefined;
    ctx.register(channel, key, nodeRef.current);
    return () => ctx.unregister(channel, key);
  }, [ctx, channel, key, node]);
}

export function ViewportSlot({ children }) { useSlot("viewport", children); return null; }
export function LeftSlot({ children }) { useSlot("left", children); return null; }
export function RightSlot({ children }) { useSlot("right", children); return null; }
export function CenterSlot({ children }) { useSlot("center", children); return null; }
export function BottomSlot({ children }) { useSlot("bottom", children); return null; }

/** Metrics / lore beside the left rail LEDs (viewport-adjacent chrome). Add class `edd-holo-rig__rail-slot--selectable` on slot root when copyable text is intentional. */
export function RailLeftSlot({ children }) { useSlot("railLeft", children); return null; }

/** Notes or widgets under the dial / vents on the right rail. Use `edd-holo-rig__rail-slot--selectable` when content should stay selectable. */
export function RailRightSlot({ children }) { useSlot("railRight", children); return null; }

/** Replaces the stock interactive dial entirely when non-empty. */
export function RailDialSlot({ children }) { useSlot("railDial", children); return null; }
