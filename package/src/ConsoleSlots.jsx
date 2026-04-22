import { createContext, useContext, useEffect, useId } from "react";

/**
 * Slot-registration system. Modules project content into the console's four
 * channels by rendering `<ConsoleSlots.Viewport/>`, `<ConsoleSlots.Left/>`,
 * etc. The host collects them via context.
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
  return (
    <SlotContext.Provider value={{ register, unregister }}>
      {children}
    </SlotContext.Provider>
  );
}

function useSlot(channel, node) {
  const ctx = useContext(SlotContext);
  const key = useId();
  useEffect(() => {
    if (!ctx) return undefined;
    ctx.register(channel, key, node);
    return () => ctx.unregister(channel, key);
  }, [ctx, channel, key, node]);
}

export function ViewportSlot({ children }) { useSlot("viewport", children); return null; }
export function LeftSlot({ children }) { useSlot("left", children); return null; }
export function RightSlot({ children }) { useSlot("right", children); return null; }
export function CenterSlot({ children }) { useSlot("center", children); return null; }
export function BottomSlot({ children }) { useSlot("bottom", children); return null; }
