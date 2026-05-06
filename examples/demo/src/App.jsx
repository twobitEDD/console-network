import { useState } from "react";
import { ConsoleHost } from "@twobitedd/console-network";
import { demoModule } from "./demoModule.jsx";
import { setDemoChromeDialSnapshot } from "./demoChromeDialBus.js";

const shellStyle = { flex: 1, display: "flex", minHeight: 0 };

const toolbarStyle = {
  position: "fixed",
  top: "max(8px, env(safe-area-inset-top))",
  left: "max(12px, env(safe-area-inset-left))",
  zIndex: 50,
  display: "flex",
  gap: "0.55rem",
  flexWrap: "wrap",
  alignItems: "center",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: "0.68rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "rgba(224, 242, 254, 0.92)",
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(56, 189, 248, 0.28)",
  borderRadius: "0.35rem",
  padding: "0.35rem 0.45rem",
};

const selectStyle = {
  marginLeft: "0.28rem",
  fontFamily: "inherit",
  fontSize: "inherit",
  letterSpacing: "inherit",
  textTransform: "inherit",
  color: "#e0f2fe",
  background: "rgba(2, 6, 23, 0.9)",
  border: "1px solid rgba(125, 211, 252, 0.35)",
  borderRadius: "0.25rem",
  padding: "0.18rem 0.28rem",
};

export default function App() {
  const [presentation, setPresentation] = useState("default");
  const [visualTier, setVisualTier] = useState("balanced");
  const immersive = presentation === "immersive";

  const pageStyle = {
    position: "fixed",
    inset: 0,
    display: "flex",
    padding: immersive ? 0 : "min(3vmin, 1.25rem)",
    boxSizing: "border-box",
  };

  return (
    <div style={pageStyle}>
      <div style={toolbarStyle} aria-label="Demo shell controls">
        <label>
          presentation
          <select
            style={selectStyle}
            value={presentation}
            onChange={(e) => setPresentation(e.target.value)}
          >
            <option value="default">default</option>
            <option value="immersive">immersive</option>
          </select>
        </label>
        <label>
          visual tier
          <select
            style={selectStyle}
            value={visualTier}
            onChange={(e) => setVisualTier(e.target.value)}
          >
            <option value="potato">potato</option>
            <option value="balanced">balanced</option>
            <option value="extra">extra</option>
          </select>
        </label>
      </div>
      <div style={shellStyle}>
        <ConsoleHost
          module={demoModule}
          connections={{
            currentProjectId: "super-tic-tac-toe",
            registryUrl: "/registry-index.json",
          }}
          presentation={presentation === "immersive" ? "immersive" : "default"}
          visualTier={visualTier}
          onChromeDial={setDemoChromeDialSnapshot}
        />
      </div>
    </div>
  );
}
