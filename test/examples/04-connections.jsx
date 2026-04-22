/* eslint-disable react-refresh/only-export-components -- reference example, not served via HMR */
/**
 * 04 · Surfacing sibling projects with the Connections panel.
 *
 * Two shipping modes:
 *
 *   a) Zero-config opt-in on ConsoleHost (demo-style):
 *
 *        <ConsoleHost
 *          module={myGame}
 *          connections={{ currentProjectId: "super-tic-tac-toe" }}
 *        />
 *
 *      The host renders a fixed-position "CONNECTIONS" pill and lazy-loads the
 *      registry the first time someone clicks it.
 *
 *   b) Standalone component — drop it anywhere, drive `open` from your own
 *      state. Useful when you want a custom trigger or want to open it
 *      programmatically (e.g. after a match ends).
 */
import { useState } from "react";
import {
  ConnectionsPanel,
  ConsoleHost,
  ConsoleSlots,
  defineGameModule,
} from "@twobitedd/console-network";

/* ---- Approach (b): a module that owns its own trigger + panel ------------- */

function CustomTriggerGame() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ConsoleSlots.Viewport>
        <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
          <button type="button" onClick={() => setOpen(true)}>
            browse the network
          </button>
        </div>
      </ConsoleSlots.Viewport>

      <ConnectionsPanel
        open={open}
        onClose={() => setOpen(false)}
        currentProjectId="super-tic-tac-toe"
      />
    </>
  );
}

export const customTriggerGame = defineGameModule({
  id: "custom-connections-trigger",
  title: "Custom Connections Trigger",
  version: "0.1.0",
  Component: CustomTriggerGame,
});

/* ---- Approach (a): zero-config via ConsoleHost prop ----------------------- */

export function App() {
  return (
    <ConsoleHost
      module={customTriggerGame}
      connections={{ currentProjectId: "super-tic-tac-toe" }}
    />
  );
}
