/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { ConsoleSlots, defineGameModule } from "@twobitedd/console-network";

const FAKE_MATCHES = [
  { id: "m1", title: "Nebula Drift", rev: "rev 0.4", status: "LIVE" },
  { id: "m2", title: "Salvage Run",  rev: "rev 2.1", status: "READY" },
  { id: "m3", title: "Sector 7",     rev: "rev 1.0", status: "LIVE" },
  { id: "m4", title: "Low Orbit",    rev: "rev 0.9", status: "IDLE" },
  { id: "m5", title: "Blackbox",     rev: "rev 3.2", status: "LIVE" },
  { id: "m6", title: "Jumpgate",     rev: "rev 0.1", status: "READY" },
];

function DemoGame({ api }) {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(FAKE_MATCHES[0].id);
  const [signedIn, setSignedIn] = useState(Boolean(api.identity?.isAuthenticated));
  const [lastEvent, setLastEvent] = useState(`mount · id=${api.identity?.handle ?? "guest"}`);

  const pop = (label) => {
    const stamp = new Date().toLocaleTimeString();
    setLastEvent(`${label} @ ${stamp}`);
  };

  return (
    <>
      {/* ═══════════ VIEWPORT — always visible ═══════════ */}
      <ConsoleSlots.Viewport>
        <div style={styles.viewport}>
          <div style={styles.viewportGrid} aria-hidden="true" />
          <h1 style={styles.viewportTitle}>CONSOLE · NETWORK</h1>
          <p style={styles.viewportStrap}>
            demo module · a React tree projected into the supreme viewport
          </p>
          <button
            type="button"
            style={styles.viewportButton}
            onClick={() => {
              setCount((c) => c + 1);
              pop("viewport tap");
            }}
          >
            tap · {count}
          </button>
          <p style={styles.viewportFoot}>
            α / β / MODAL / HUD all load independently — try the toggle buttons below.
          </p>
        </div>
      </ConsoleSlots.Viewport>

      {/* ═══════════ α LEFT — Frame 1 — list rail ═══════════ */}
      <ConsoleSlots.Left>
        <section style={styles.panel}>
          <header style={styles.panelHeader}>
            <span style={{ ...styles.dot, background: "#f87171" }} />
            <h2 style={styles.panelTitle}>α · matches</h2>
            <span style={styles.panelBadge}>frame 1</span>
          </header>
          <p style={styles.panelBody}>
            Selection persists in module state; the host does not know or care.
          </p>
          <ul style={styles.list}>
            {FAKE_MATCHES.map((m) => {
              const active = selected === m.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    style={{
                      ...styles.listItem,
                      borderColor: active ? "#f87171" : "rgba(248,113,113,0.25)",
                      background: active ? "rgba(248,113,113,0.12)" : "transparent",
                    }}
                    onClick={() => {
                      setSelected(m.id);
                      pop(`α select: ${m.title}`);
                    }}
                  >
                    <strong>{m.title}</strong>
                    <span style={styles.listMeta}>
                      {m.rev} · {m.status}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </ConsoleSlots.Left>

      {/* ═══════════ β RIGHT — Frame 2 — identity rail ═══════════ */}
      <ConsoleSlots.Right>
        <section style={styles.panel}>
          <header style={styles.panelHeader}>
            <span style={{ ...styles.dot, background: "#f87171" }} />
            <h2 style={styles.panelTitle}>β · identity</h2>
            <span style={styles.panelBadge}>frame 2</span>
          </header>
          <dl style={styles.kv}>
            <dt>handle</dt>
            <dd>{signedIn ? "pilot-0x42" : "guest"}</dd>
            <dt>address</dt>
            <dd>{signedIn ? "0xA113…f00d" : "—"}</dd>
            <dt>chain</dt>
            <dd>{signedIn ? "base · 8453" : "—"}</dd>
          </dl>
          <button
            type="button"
            style={styles.buttonPrimary}
            onClick={() => {
              setSignedIn((v) => !v);
              pop(signedIn ? "β signed out" : "β signed in");
            }}
          >
            {signedIn ? "sign out" : "sign in"}
          </button>
        </section>
      </ConsoleSlots.Right>

      {/* ═══════════ MODAL CENTER — Frame 3 — prompts / outcomes ═══════════ */}
      <ConsoleSlots.Center>
        <section style={styles.panel}>
          <header style={styles.panelHeader}>
            <span style={{ ...styles.dot, background: "#ec4899" }} />
            <h2 style={styles.panelTitle}>modal · dialog</h2>
            <span style={styles.panelBadge}>frame 3</span>
          </header>
          <p style={styles.panelBody}>
            This is the center channel — scale + fade in. Typical use: pre-game
            prompts, post-game outcomes, confirmations.
          </p>
          <p style={styles.panelBody}>
            Counter snapshot: <strong>{count}</strong>
          </p>
          <div style={styles.row}>
            <button
              type="button"
              style={styles.buttonPrimary}
              onClick={() => {
                api.channels.setCenter(false);
                pop("modal dismissed");
              }}
            >
              close
            </button>
            <button
              type="button"
              style={styles.buttonGhost}
              onClick={() => {
                setCount(0);
                pop("counter reset via modal");
              }}
            >
              reset counter
            </button>
          </div>
        </section>
      </ConsoleSlots.Center>

      {/* ═══════════ HUD BOTTOM — Frame 4 — live controls ═══════════ */}
      <ConsoleSlots.Bottom>
        <section style={styles.hud}>
          <div style={styles.hudLeft}>
            <span style={{ ...styles.dot, background: "#4ade80" }} />
            <div>
              <strong style={styles.hudTitle}>HUD · frame 4</strong>
              <div style={styles.hudSub}>
                count <b>{count}</b> · last event <b>{lastEvent}</b>
              </div>
            </div>
          </div>
          <div style={styles.hudRight}>
            <button type="button" style={styles.buttonSmall} onClick={() => { api.channels.setLeft(true);   pop("open α"); }}>open α</button>
            <button type="button" style={styles.buttonSmall} onClick={() => { api.channels.setRight(true);  pop("open β"); }}>open β</button>
            <button type="button" style={styles.buttonSmall} onClick={() => { api.channels.setCenter(true); pop("open modal"); }}>open modal</button>
            <button type="button" style={styles.buttonSmall} onClick={() => {
              api.channels.setLeft(false);
              api.channels.setRight(false);
              api.channels.setCenter(false);
              pop("close all");
            }}>close all</button>
          </div>
        </section>
      </ConsoleSlots.Bottom>
    </>
  );
}

export const demoModule = defineGameModule({
  id: "console-demo",
  title: "Console Demo",
  version: "0.1.0",
  plate: { sticker: "demo" },
  Component: DemoGame,
});

const styles = {
  viewport: {
    position: "relative",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem 1rem",
    gap: "0.75rem",
    textAlign: "center",
    color: "#e0f2fe",
  },
  viewportGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(56,189,248,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    maskImage: "radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)",
  },
  viewportTitle: {
    margin: 0,
    fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
    letterSpacing: "0.18em",
    fontWeight: 700,
    textShadow: "0 0 18px rgba(56, 189, 248, 0.45)",
    position: "relative",
  },
  viewportStrap: {
    margin: 0,
    fontSize: "0.78rem",
    color: "rgba(186, 230, 253, 0.72)",
    position: "relative",
  },
  viewportButton: {
    position: "relative",
    padding: "0.7rem 1.4rem",
    fontSize: "1rem",
    letterSpacing: "0.08em",
    borderRadius: "999px",
    color: "#f0fdfa",
    background: "linear-gradient(180deg, rgba(14,165,233,0.45), rgba(2,132,199,0.85))",
    border: "1px solid rgba(56, 189, 248, 0.6)",
    boxShadow: "0 10px 24px rgba(2, 132, 199, 0.3)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  viewportFoot: {
    margin: 0,
    fontSize: "0.66rem",
    color: "rgba(165, 243, 252, 0.55)",
    position: "relative",
  },

  panel: {
    color: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    fontSize: "0.82rem",
    lineHeight: 1.4,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.25rem",
  },
  panelTitle: {
    margin: 0,
    fontSize: "0.95rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    flex: 1,
  },
  panelBadge: {
    fontSize: "0.6rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    padding: "0.15rem 0.4rem",
    borderRadius: "0.3rem",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    color: "#fca5a5",
  },
  panelBody: { margin: 0, color: "#cbd5e1" },
  dot: { width: "0.55rem", height: "0.55rem", borderRadius: "50%", display: "inline-block" },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: "0.4rem",
  },
  listItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
    width: "100%",
    padding: "0.55rem 0.7rem",
    borderRadius: "0.45rem",
    border: "1px solid rgba(248, 113, 113, 0.25)",
    color: "#fecaca",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s ease, border-color 0.15s ease",
  },
  listMeta: { fontSize: "0.7rem", color: "rgba(252, 165, 165, 0.7)" },

  kv: {
    margin: 0,
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    columnGap: "0.75rem",
    rowGap: "0.3rem",
    fontSize: "0.8rem",
  },

  row: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },

  buttonPrimary: {
    padding: "0.45rem 0.9rem",
    borderRadius: "0.4rem",
    border: "1px solid rgba(244, 114, 182, 0.55)",
    background: "rgba(244, 114, 182, 0.18)",
    color: "#fbcfe8",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.8rem",
  },
  buttonGhost: {
    padding: "0.45rem 0.9rem",
    borderRadius: "0.4rem",
    border: "1px solid rgba(148, 163, 184, 0.45)",
    background: "transparent",
    color: "#e2e8f0",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.8rem",
  },
  buttonSmall: {
    padding: "0.28rem 0.55rem",
    borderRadius: "0.3rem",
    border: "1px solid rgba(74, 222, 128, 0.5)",
    background: "rgba(16, 80, 50, 0.45)",
    color: "#bbf7d0",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.7rem",
    letterSpacing: "0.04em",
  },

  hud: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.8rem",
    flexWrap: "wrap",
  },
  hudLeft: { display: "flex", alignItems: "center", gap: "0.6rem", color: "#ecfccb" },
  hudTitle: { fontSize: "0.9rem", letterSpacing: "0.08em" },
  hudSub: { fontSize: "0.7rem", color: "rgba(190, 242, 100, 0.72)" },
  hudRight: { display: "flex", gap: "0.35rem", flexWrap: "wrap" },
};
