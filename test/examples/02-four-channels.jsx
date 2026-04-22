/* eslint-disable react-refresh/only-export-components -- reference example, not served via HMR */
/**
 * 02 · A module that touches every slot.
 *
 * Projects content into:
 *   - Viewport    always visible
 *   - Left (α)    a list rail
 *   - Right (β)   identity-adjacent rail
 *   - Center      pre-game / post-game MODAL
 *   - Bottom      live HUD
 *
 * The module also uses `api.channels.setCenter(true)` to open the MODAL
 * imperatively when a condition is reached — this is how games pop an
 * outcome card without the host needing to know game rules.
 */
import { useEffect, useState } from "react";
import { defineGameModule, ConsoleSlots } from "@twobitedd/console-network";

function FourChannelsDemo({ api }) {
  const [count, setCount]       = useState(0);
  const [selected, setSelected] = useState(null);
  const gameOver = count >= 5;

  useEffect(() => {
    if (gameOver) api.channels.setCenter(true);
  }, [gameOver, api]);

  return (
    <>
      {/* VIEWPORT */}
      <ConsoleSlots.Viewport>
        <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
          <button type="button" onClick={() => setCount((c) => c + 1)}>
            tap ({count}/5)
          </button>
        </div>
      </ConsoleSlots.Viewport>

      {/* α LEFT */}
      <ConsoleSlots.Left>
        <h2>matches</h2>
        <ul>
          {["alpha", "bravo", "charlie"].map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setSelected(id)}
                aria-pressed={selected === id}
              >
                {id}
              </button>
            </li>
          ))}
        </ul>
      </ConsoleSlots.Left>

      {/* β RIGHT */}
      <ConsoleSlots.Right>
        <h2>identity</h2>
        <p>{api.identity?.handle ?? "guest"}</p>
        {api.identity?.signIn && (
          <button type="button" onClick={() => api.identity.signIn()}>
            sign in
          </button>
        )}
      </ConsoleSlots.Right>

      {/* MODAL — only rendered when we need it */}
      {gameOver && (
        <ConsoleSlots.Center>
          <h2>nice work</h2>
          <p>you tapped {count} times</p>
          <button
            type="button"
            onClick={() => {
              setCount(0);
              api.channels.setCenter(false);
            }}
          >
            play again
          </button>
        </ConsoleSlots.Center>
      )}

      {/* HUD */}
      <ConsoleSlots.Bottom>
        <strong>HUD</strong> · count: {count} · selected: {selected ?? "—"}
      </ConsoleSlots.Bottom>
    </>
  );
}

export const fourChannelsDemo = defineGameModule({
  id: "four-channels-demo",
  title: "Four Channels",
  version: "0.1.0",
  Component: FourChannelsDemo,
});
