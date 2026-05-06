import { useCallback, useEffect, useId, useState } from "react";

const btnBase = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: "0.65rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: "pointer",
};

export default function DemoSettingsMenu({
  themes,
  effectiveSlug,
  onThemeSlugChange,
  presentation,
  onPresentationChange,
  visualTier,
  onVisualTierChange,
  effects,
  onEffectsChange,
  respectReducedMotion,
  onRespectReducedMotionChange,
  connectionsEnabled,
  onConnectionsEnabledChange,
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "7.5rem 1fr",
    gap: "0.35rem 0.5rem",
    alignItems: "center",
    marginBottom: "0.55rem",
  };

  const labelStyle = {
    margin: 0,
    color: "rgba(148, 163, 184, 0.95)",
    fontSize: "0.62rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  };

  const selectStyle = {
    ...btnBase,
    width: "100%",
    padding: "0.28rem 0.35rem",
    color: "#e0f2fe",
    background: "rgba(2, 6, 23, 0.92)",
    border: "1px solid rgba(125, 211, 252, 0.35)",
    borderRadius: "0.25rem",
  };

  return (
    <>
      {open ? (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 59,
            background: "rgba(2, 6, 23, 0.22)",
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            close();
          }}
        />
      ) : null}

      <div
        style={{
          position: "fixed",
          top: "max(8px, env(safe-area-inset-top))",
          right: "max(10px, env(safe-area-inset-right))",
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.35rem",
        }}
      >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        style={{
          ...btnBase,
          padding: "0.32rem 0.55rem",
          borderRadius: "0.3rem",
          border: "1px solid rgba(125, 211, 252, 0.42)",
          background: "rgba(15, 23, 42, 0.88)",
          color: "rgba(224, 242, 254, 0.95)",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35)",
        }}
        onClick={() => setOpen((v) => !v)}
      >
        demo · settings
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Demo settings"
          style={{
            width: "min(18.5rem, calc(100vw - 1.25rem))",
            boxSizing: "border-box",
            padding: "0.65rem 0.7rem 0.55rem",
            borderRadius: "0.4rem",
            border: "1px solid rgba(56, 189, 248, 0.28)",
            background: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
          }}
        >
          <p
            style={{
              margin: "0 0 0.55rem",
              fontFamily: btnBase.fontFamily,
              fontSize: "0.58rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(186, 230, 253, 0.72)",
            }}
          >
            theme & shell
          </p>

          <div style={rowStyle}>
            <label htmlFor={`${panelId}-theme`} style={labelStyle}>
              theme
            </label>
            <select
              id={`${panelId}-theme`}
              style={selectStyle}
              value={effectiveSlug}
              disabled={themes.length === 0}
              onChange={(e) => onThemeSlugChange(e.target.value)}
            >
              {themes.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div style={rowStyle}>
            <label htmlFor={`${panelId}-presentation`} style={labelStyle}>
              presentation
            </label>
            <select
              id={`${panelId}-presentation`}
              style={selectStyle}
              value={presentation}
              onChange={(e) => onPresentationChange(e.target.value)}
            >
              <option value="default">default</option>
              <option value="immersive">immersive</option>
            </select>
          </div>

          <p
            style={{
              margin: "0.35rem 0 0.55rem",
              fontFamily: btnBase.fontFamily,
              fontSize: "0.58rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(186, 230, 253, 0.72)",
            }}
          >
            performance
          </p>

          <div style={rowStyle}>
            <label htmlFor={`${panelId}-tier`} style={labelStyle}>
              visual tier
            </label>
            <select
              id={`${panelId}-tier`}
              style={selectStyle}
              value={visualTier}
              onChange={(e) => onVisualTierChange(e.target.value)}
            >
              <option value="potato">potato — minimal FX</option>
              <option value="balanced">balanced</option>
              <option value="extra">extra — lens shading</option>
            </select>
          </div>

          <div style={rowStyle}>
            <label htmlFor={`${panelId}-effects`} style={labelStyle}>
              effects
            </label>
            <select
              id={`${panelId}-effects`}
              style={selectStyle}
              value={effects}
              onChange={(e) => onEffectsChange(e.target.value)}
            >
              <option value="full">full — chrome motion</option>
              <option value="lite">lite — fast transitions</option>
            </select>
          </div>

          <DemoToggleRow
            id={`${panelId}-prm`}
            label="honor reduced motion"
            checked={respectReducedMotion}
            onChange={onRespectReducedMotionChange}
            hint="OS setting + effects full → less animation"
          />

          <p
            style={{
              margin: "0.35rem 0 0.55rem",
              fontFamily: btnBase.fontFamily,
              fontSize: "0.58rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(186, 230, 253, 0.72)",
            }}
          >
            toggles
          </p>

          <DemoToggleRow
            id={`${panelId}-conn`}
            label="connections panel"
            checked={connectionsEnabled}
            onChange={onConnectionsEnabledChange}
            hint="registry browse UI + trigger"
          />

          <p
            style={{
              margin: "0.55rem 0 0",
              fontSize: "0.55rem",
              lineHeight: 1.45,
              color: "rgba(148, 163, 184, 0.78)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Potato tier and lite effects stack for low-GPU testing. Turn off
            “honor reduced motion” with effects full to stress CRT chrome (where
            supported).
          </p>
        </div>
      ) : null}
      </div>
    </>
  );
}

function DemoToggleRow({ id, label, checked, onChange, hint }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "7.5rem 1fr",
        gap: "0.35rem 0.5rem",
        alignItems: "center",
        marginBottom: "0.55rem",
      }}
    >
      <span
        id={`${id}-label`}
        style={{
          margin: 0,
          color: "rgba(148, 163, 184, 0.95)",
          fontSize: "0.62rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.18rem" }}>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={`${id}-label`}
          style={{
            justifySelf: "start",
            padding: "0.22rem 0.5rem",
            borderRadius: "999px",
            border: `1px solid ${checked ? "rgba(52, 211, 153, 0.55)" : "rgba(148, 163, 184, 0.4)"}`,
            background: checked ? "rgba(6, 78, 59, 0.55)" : "rgba(30, 41, 59, 0.65)",
            color: checked ? "#bbf7d0" : "rgba(226, 232, 240, 0.85)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "0.58rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
          onClick={() => onChange(!checked)}
        >
          {checked ? "on" : "off"}
        </button>
        {hint ? (
          <span
            style={{
              fontSize: "0.52rem",
              color: "rgba(100, 116, 139, 0.95)",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.35,
            }}
          >
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}
