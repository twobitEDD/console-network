import { useCallback, useEffect, useRef, useState } from "react";
import InteractiveDial from "./InteractiveDial.jsx";

/**
 * Salvage-rig holo shell: full-bleed game viewport with optional overlays
 * (list rails L/R, center modal, bottom HUD) stacked above the field inside the lens.
 */
export default function HoloFrameConsole({
  rigAria,
  plateId,
  plateRev,
  caption,
  sticker = null,
  viewport,
  leftChannel = null,
  rightChannel = null,
  centerChannel = null,
  bottomChannel = null,
  /** Salvage-rig chrome beside viewport (default presentation). */
  railLeftChannel = null,
  railRightChannel = null,
  railDialChannel = null,
  /** Dragging the stock dial emits via ConsoleHost → `emit('chrome:dial', { degrees, normalized })`. */
  onChromeDialChange = undefined,
  displayOn,
  onDisplayToggle,
  engageLabel,
  standbyLabel,
  showReset = false,
  onReset,
  resetLabel,
  extraFooterActions = null,
  leftToggleLabel,
  rightToggleLabel,
  bottomToggleLabel,
  leftToggleAria,
  rightToggleAria,
  bottomToggleAria,
  centerToggleLabel,
  centerToggleAria,
  leftOpen: controlledLeft,
  onLeftOpenChange,
  rightOpen: controlledRight,
  onRightOpenChange,
  centerOpen: controlledCenter,
  onCenterOpenChange,
  bottomOpen: controlledBottom,
  onBottomOpenChange,
  /** Lens parallax (ignored while `motionReduced`) */
  parallaxEnabled = true,
  motionReduced = false,
  forceFullMotionCss = false,
  presentation = "default",
  visualTier = "balanced",
  tierExtra = false,
  immersiveDeckPinned = false,
  /** @see useConsoleChannels shell.immersiveChromeRevealed */
  immersiveChromeRevealed = true,
  onImmersiveChromeRevealedChange = undefined,
  immersiveEdgeShowConnections = false,
  onImmersiveEdgeConnections = undefined,
  /** Browser Fullscreen API: true when this host root is fullscreen (immersive only). */
  presentationFullscreenActive = false,
  onImmersivePresentationFullscreen = undefined,
  footerDecorLeft = null,
  footerDecorRight = null,
}) {
  const lensRef = useRef(null);
  const parallaxRafRef = useRef(0);
  const parallaxPendingRef = useRef(null);
  const [iLeft, setILeft] = useState(false);
  const [iRight, setIRight] = useState(false);
  const [iCenter, setICenter] = useState(false);
  const [iBottom, setIBottom] = useState(true);

  const leftOpen = controlledLeft !== undefined ? controlledLeft : iLeft;
  const rightOpen = controlledRight !== undefined ? controlledRight : iRight;
  const centerOpen = controlledCenter !== undefined ? controlledCenter : iCenter;
  const bottomOpen = controlledBottom !== undefined ? controlledBottom : iBottom;

  const setLeftOpen = useCallback(
    (next) => {
      onLeftOpenChange?.(next);
      if (controlledLeft === undefined) {
        setILeft(next);
      }
    },
    [controlledLeft, onLeftOpenChange],
  );

  const setRightOpen = useCallback(
    (next) => {
      onRightOpenChange?.(next);
      if (controlledRight === undefined) {
        setIRight(next);
      }
    },
    [controlledRight, onRightOpenChange],
  );

  const setBottomOpen = useCallback(
    (next) => {
      onBottomOpenChange?.(next);
      if (controlledBottom === undefined) {
        setIBottom(next);
      }
    },
    [controlledBottom, onBottomOpenChange],
  );

  const setCenterOpen = useCallback(
    (next) => {
      onCenterOpenChange?.(next);
      if (controlledCenter === undefined) {
        setICenter(next);
      }
    },
    [controlledCenter, onCenterOpenChange],
  );

  /* extra tier: TV-style lens is CSS-only; pointer-driven parallax/glow fights games and causes flicker */
  const lensParallaxActive = Boolean(parallaxEnabled) && !motionReduced && !tierExtra;
  /* No pointer-driven glare on the lens — overlays handle hover affordances */

  const onLensPointerMove = useCallback(
    (event) => {
      if (!lensParallaxActive) {
        return;
      }
      const target = lensRef.current;
      if (!target) {
        return;
      }
      parallaxPendingRef.current = { clientX: event.clientX, clientY: event.clientY };
      if (parallaxRafRef.current) {
        return;
      }
      parallaxRafRef.current = requestAnimationFrame(() => {
        parallaxRafRef.current = 0;
        const el = lensRef.current;
        const pending = parallaxPendingRef.current;
        if (!el || !pending) {
          return;
        }
        const rect = el.getBoundingClientRect();
        const x = ((pending.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((pending.clientY - rect.top) / rect.height) * 2 - 1;
        el.style.setProperty("--edd-px", x.toFixed(4));
        el.style.setProperty("--edd-py", y.toFixed(4));
      });
    },
    [lensParallaxActive],
  );

  const onLensPointerLeave = useCallback(() => {
    parallaxPendingRef.current = null;
    if (parallaxRafRef.current) {
      cancelAnimationFrame(parallaxRafRef.current);
      parallaxRafRef.current = 0;
    }
    if (!lensParallaxActive) return;
    lensRef.current?.style.setProperty("--edd-px", "0");
    lensRef.current?.style.setProperty("--edd-py", "0");
  }, [lensParallaxActive]);

  useEffect(
    () => () => {
      if (parallaxRafRef.current) {
        cancelAnimationFrame(parallaxRafRef.current);
      }
    },
    [],
  );

  const hasLeft = Boolean(leftChannel);
  const hasRight = Boolean(rightChannel);
  const hasCenter = Boolean(centerChannel);
  const hasBottom = Boolean(bottomChannel);
  const hasRailLeft = Boolean(railLeftChannel);
  const hasRailRight = Boolean(railRightChannel);
  const hasRailDial = Boolean(railDialChannel);
  const showDeckToggles = hasLeft || hasRight || hasCenter || hasBottom;

  const immersive = presentation === "immersive";

  const rigClassName = [
    "edd-holo-rig holo-console-rig",
    motionReduced ? "edd-holo-rig--effects-lite" : "",
    forceFullMotionCss ? "edd-holo-rig--effects-full" : "",
    immersive ? "edd-holo-rig--immersive" : "",
    immersive && !immersiveChromeRevealed ? "edd-holo-rig--immersive-chrome-hidden" : "",
    `edd-holo-rig--tier-${visualTier}`,
    tierExtra ? "edd-holo-rig--extra-motion" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const footerClass =
    immersive && immersiveDeckPinned ? "edd-holo-rig__footer is-peek-pinned" : "edd-holo-rig__footer";

  const footerEl = (
      <footer className={footerClass}>
        <div className="edd-holo-rig__footer-channel holo-console-footer-deck">
          {showDeckToggles ? (
            <>
              <div className="holo-console-footer-toggles">
                {hasLeft ? (
                  <button
                    type="button"
                    className="edd-holo-rig__channel-toggle"
                    aria-pressed={leftOpen}
                    aria-label={leftToggleAria}
                    onClick={() => setLeftOpen(!leftOpen)}
                  >
                    {leftToggleLabel}
                  </button>
                ) : null}
                {hasRight ? (
                  <button
                    type="button"
                    className="edd-holo-rig__channel-toggle"
                    aria-pressed={rightOpen}
                    aria-label={rightToggleAria}
                    onClick={() => setRightOpen(!rightOpen)}
                  >
                    {rightToggleLabel}
                  </button>
                ) : null}
                {hasCenter ? (
                  <button
                    type="button"
                    className="edd-holo-rig__channel-toggle"
                    aria-pressed={centerOpen}
                    aria-label={centerToggleAria}
                    onClick={() => setCenterOpen(!centerOpen)}
                  >
                    {centerToggleLabel}
                  </button>
                ) : null}
                {hasBottom ? (
                  <button
                    type="button"
                    className="edd-holo-rig__channel-toggle"
                    aria-pressed={bottomOpen}
                    aria-label={bottomToggleAria}
                    onClick={() => setBottomOpen(!bottomOpen)}
                  >
                    {bottomToggleLabel}
                  </button>
                ) : null}
              </div>
              <span className="edd-holo-rig__footer-wave" aria-hidden="true" />
            </>
          ) : (
            <>
              {footerDecorLeft}
              <span className="edd-holo-rig__footer-wave" aria-hidden="true" />
              {footerDecorRight}
            </>
          )}
        </div>
        <div className="edd-holo-rig__footer-actions">
          {extraFooterActions}
          {showReset && onReset ? (
            <button type="button" className="edd-holo-rig__reset" onClick={onReset}>
              {resetLabel}
            </button>
          ) : null}
          <button
            type="button"
            className="edd-holo-rig__power"
            aria-pressed={displayOn}
            onClick={() => onDisplayToggle?.(!displayOn)}
          >
            {displayOn ? standbyLabel : engageLabel}
          </button>
        </div>
      </footer>
  );

  return (
    <section className={rigClassName} aria-label={rigAria ?? caption}>
      <div className="edd-holo-rig__top-hazard" aria-hidden="true" />
      {sticker ? (
        <span className="edd-holo-rig__sticker" aria-hidden="true">
          {sticker}
        </span>
      ) : null}
      <span className="edd-holo-rig__warning-strip" aria-hidden="true" />
      <header className="edd-holo-rig__plate">
        <span className="edd-holo-rig__plate-id">{plateId}</span>
        <span className="edd-holo-rig__plate-rev">{plateRev}</span>
        <div className="edd-holo-rig__plate-leds" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </header>

      <div className="holo-console-stage">
        <div className="holo-console-core">
          <div className="edd-holo-rig__body">
            <aside
              className="edd-holo-rig__rail edd-holo-rig__rail--left"
              aria-label="Left chassis telemetry"
            >
              <div className="edd-holo-rig__ticks" aria-hidden="true" />
              <div className="edd-holo-rig__led-column" aria-hidden="true">
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={`led-l-${i}`} className="edd-holo-rig__led" />
                ))}
              </div>
              {hasRailLeft ? (
                <div className="edd-holo-rig__rail-slot edd-holo-rig__rail-slot--left">
                  {railLeftChannel}
                </div>
              ) : null}
            </aside>

            <div className={`edd-holo-glass edd-holo-glass--${displayOn ? "on" : "off"}`}>
              <div
                ref={lensRef}
                className={`edd-holo-glass__lens${tierExtra ? " edd-holo-glass__lens--physical" : ""}`}
                onPointerMove={lensParallaxActive ? onLensPointerMove : undefined}
                onPointerLeave={lensParallaxActive ? onLensPointerLeave : undefined}
              >
                <span className="edd-holo-glass__lens-rim" aria-hidden="true" />
                <span className="edd-holo-glass__lens-arc" aria-hidden="true" />
                <div className="edd-holo-glass__viewport">
                  <div className="edd-holo-glass__viewport-surface">{viewport}</div>
                </div>
                <span className="edd-holo-glass__shine" aria-hidden="true" />
                <span className="edd-holo-glass__tint" aria-hidden="true" />
                <span className="edd-holo-glass__scanlines" aria-hidden="true" />
                <span className="edd-holo-glass__noise" aria-hidden="true" />
                <span className="edd-holo-glass__chroma" aria-hidden="true" />
                <span className="edd-holo-glass__vignette" aria-hidden="true" />
                {tierExtra ? <span className="edd-holo-glass__lens-breathe-layer" aria-hidden="true" /> : null}
                {tierExtra ? <span className="edd-holo-glass__lens-prism" aria-hidden="true" /> : null}
                <div
                  className="holo-overlay-root"
                  aria-hidden={!leftOpen && !rightOpen && !centerOpen && !bottomOpen}
                >
                  {hasLeft ? (
                    <aside
                      className={`holo-overlay holo-overlay--left${leftOpen ? " is-open" : " is-dismissed"}`}
                      aria-hidden={!leftOpen}
                    >
                      <div className="holo-overlay__panel holo-overlay__panel--list holo-overlay__panel--frame1">
                        {leftChannel}
                      </div>
                    </aside>
                  ) : null}
                  {hasRight ? (
                    <aside
                      className={`holo-overlay holo-overlay--right${rightOpen ? " is-open" : " is-dismissed"}`}
                      aria-hidden={!rightOpen}
                    >
                      <div className="holo-overlay__panel holo-overlay__panel--list holo-overlay__panel--frame2">
                        {rightChannel}
                      </div>
                    </aside>
                  ) : null}
                  {hasCenter ? (
                    <div
                      className={`holo-overlay holo-overlay--center${centerOpen ? " is-open" : " is-dismissed"}`}
                      aria-hidden={!centerOpen}
                    >
                      <div className="holo-overlay__panel holo-overlay__panel--center holo-overlay__panel--frame3">
                        {centerChannel}
                      </div>
                    </div>
                  ) : null}
                  {hasBottom ? (
                    <div
                      className={`holo-overlay holo-overlay--bottom${bottomOpen ? " is-open" : " is-dismissed"}`}
                      aria-hidden={!bottomOpen}
                    >
                      <div className="holo-overlay__panel holo-overlay__panel--bottom holo-overlay__panel--frame4">
                        {bottomChannel}
                      </div>
                    </div>
                  ) : null}
                </div>
                {immersive ? (
                  <div className="edd-holo-rig__immersive-edge" role="toolbar" aria-label="Console">
                    {immersiveChromeRevealed ? (
                      <button
                        type="button"
                        className="edd-holo-rig__immersive-edge-btn"
                        aria-label="Hide console deck"
                        title="Hide console deck"
                        onClick={() => onImmersiveChromeRevealedChange?.(false)}
                      >
                        ‹
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="edd-holo-rig__immersive-edge-btn edd-holo-rig__immersive-edge-btn--primary"
                        aria-label="Show console deck"
                        title="Show console deck"
                        onClick={() => onImmersiveChromeRevealedChange?.(true)}
                      >
                        ›
                      </button>
                    )}
                    {onImmersivePresentationFullscreen ? (
                      <button
                        type="button"
                        className="edd-holo-rig__immersive-edge-btn edd-holo-rig__immersive-edge-btn--fullscreen"
                        aria-label={
                          presentationFullscreenActive ? "Exit system fullscreen" : "Enter system fullscreen"
                        }
                        title={presentationFullscreenActive ? "Exit fullscreen" : "Fullscreen"}
                        onClick={() => onImmersivePresentationFullscreen()}
                      >
                        {presentationFullscreenActive ? "⤓" : "⛶"}
                      </button>
                    ) : null}
                    {immersiveEdgeShowConnections ? (
                      <button
                        type="button"
                        className="edd-holo-rig__immersive-edge-btn edd-holo-rig__immersive-edge-btn--accent"
                        aria-label="Connections"
                        title="Connections"
                        onClick={() => onImmersiveEdgeConnections?.()}
                      >
                        ◎
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <p className="edd-holo-glass__caption">{caption}</p>
            </div>

            <aside
              className="edd-holo-rig__rail edd-holo-rig__rail--right"
              aria-label="Right chassis controls"
            >
              <div className="edd-holo-rig__dial-host">
                {hasRailDial ? (
                  railDialChannel
                ) : (
                  <InteractiveDial
                    motionReduced={motionReduced}
                    onRotationChange={onChromeDialChange}
                  />
                )}
              </div>
              {hasRailRight ? (
                <div className="edd-holo-rig__rail-slot edd-holo-rig__rail-slot--right">
                  {railRightChannel}
                </div>
              ) : null}
              <div className="edd-holo-rig__vents" aria-hidden="true" />
              <div className="edd-holo-rig__screws" aria-hidden="true">
                <span />
                <span />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {immersive ? (
        immersiveChromeRevealed ? (
          <div className="edd-holo-rig__immersive-dock">
            <div className="edd-holo-rig__peek-hitbox" aria-hidden />
            {footerEl}
          </div>
        ) : null
      ) : (
        footerEl
      )}
    </section>
  );
}
