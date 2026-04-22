/* eslint-disable react-refresh/only-export-components -- reference example, not served via HMR */
/**
 * 01 · The smallest valid GameModule.
 *
 * A module is just an object with { id, title, Component }. That's it.
 * Everything else is optional (version, plate metadata, requires, onMount).
 *
 * `defineGameModule` is a no-op wrapper that validates at author time and
 * gives your editor JSDoc autocomplete. You can skip it in plain JS if you
 * want; the host only cares about the shape.
 */
import { defineGameModule, ConsoleSlots } from "@twobitedd/console-network";

function TinyGame() {
  return (
    <ConsoleSlots.Viewport>
      <p style={{ margin: "auto" }}>hello, console</p>
    </ConsoleSlots.Viewport>
  );
}

export const tinyGame = defineGameModule({
  id: "tiny",
  title: "Tiny",
  Component: TinyGame,
});
