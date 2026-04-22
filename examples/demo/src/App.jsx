import { ConsoleHost } from "@twobitedd/console-network";
import { demoModule } from "./demoModule.jsx";

const pageStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",
  padding: "min(3vmin, 1.25rem)",
  boxSizing: "border-box",
};

const shellStyle = { flex: 1, display: "flex", minHeight: 0 };

export default function App() {
  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <ConsoleHost
          module={demoModule}
          connections={{
            currentProjectId: "super-tic-tac-toe",
            registryUrl: "/registry-index.json",
          }}
        />
      </div>
    </div>
  );
}
