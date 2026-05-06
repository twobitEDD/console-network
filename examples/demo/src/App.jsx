import { useEffect, useMemo, useState } from "react";
import { ConsoleHost } from "@twobitedd/console-network";
import { demoModule } from "./demoModule.jsx";
import { setDemoChromeDialSnapshot } from "./demoChromeDialBus.js";
import DemoSettingsMenu from "./DemoSettingsMenu.jsx";

const shellStyle = { flex: 1, display: "flex", minHeight: 0 };

export default function App() {
  const [presentation, setPresentation] = useState("default");
  const [visualTier, setVisualTier] = useState("balanced");
  const [effects, setEffects] = useState("full");
  const [respectReducedMotion, setRespectReducedMotion] = useState(true);
  const [connectionsEnabled, setConnectionsEnabled] = useState(true);
  const [themes, setThemes] = useState([]);
  const [themeSlug, setThemeSlug] = useState("noxcruiser");

  const immersive = presentation === "immersive";

  useEffect(() => {
    let cancelled = false;
    fetch("/registry-index.json")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data.themes)) return;
        setThemes(data.themes);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveSlug = useMemo(() => {
    if (!themes.some((t) => t.slug === themeSlug)) {
      return themes[0]?.slug ?? themeSlug;
    }
    return themeSlug;
  }, [themes, themeSlug]);

  const activeTheme = useMemo(
    () => themes.find((t) => t.slug === effectiveSlug) ?? null,
    [themes, effectiveSlug],
  );

  useEffect(() => {
    const css = activeTheme?.css;
    const slug = activeTheme?.slug;
    if (!css || !slug) return undefined;
    const prev = document.querySelectorAll("link[data-demo-console-theme]");
    prev.forEach((el) => el.remove());
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = css;
    link.dataset.demoConsoleTheme = slug;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [activeTheme?.css, activeTheme?.slug]);

  const themeClass = activeTheme ? `console-theme-${activeTheme.slug}` : "";

  const pageStyle = {
    position: "fixed",
    inset: 0,
    display: "flex",
    padding: immersive ? 0 : "min(3vmin, 1.25rem)",
    boxSizing: "border-box",
  };

  return (
    <div style={pageStyle}>
      <DemoSettingsMenu
        themes={themes}
        effectiveSlug={effectiveSlug}
        onThemeSlugChange={setThemeSlug}
        presentation={presentation}
        onPresentationChange={setPresentation}
        visualTier={visualTier}
        onVisualTierChange={setVisualTier}
        effects={effects}
        onEffectsChange={setEffects}
        respectReducedMotion={respectReducedMotion}
        onRespectReducedMotionChange={setRespectReducedMotion}
        connectionsEnabled={connectionsEnabled}
        onConnectionsEnabledChange={setConnectionsEnabled}
      />
      <div className={themeClass} style={shellStyle}>
        <ConsoleHost
          module={demoModule}
          connections={
            connectionsEnabled
              ? {
                  currentProjectId: "super-tic-tac-toe",
                  registryUrl: "/registry-index.json",
                }
              : false
          }
          presentation={presentation === "immersive" ? "immersive" : "default"}
          visualTier={visualTier}
          effects={effects === "lite" ? "lite" : "full"}
          respectReducedMotion={respectReducedMotion}
          onChromeDial={setDemoChromeDialSnapshot}
        />
      </div>
    </div>
  );
}
