import { useCallback, useRef, useState } from "react";

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
  parallaxEnabled = true,
  footerDecorLeft = null,
  footerDecorRight = null,
}) {
  const lensRef = useRef(null);
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

  const onLensPointerMove = useCallback(
    (event) => {
      if (!parallaxEnabled) {
        return;
      }
      const el = lensRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      el.style.setProperty("--edd-px", x.toFixed(4));
      el.style.setProperty("--edd-py", y.toFixed(4));
    },
    [parallaxEnabled],
  );

  const onLensPointerLeave = useCallback(() => {
    lensRef.current?.style.setProperty("--edd-px", "0");
    lensRef.current?.style.setProperty("--edd-py", "0");
  }, []);

  const hasLeft = Boolean(leftChannel);
  const hasRight = Boolean(rightChannel);
  const hasCenter = Boolean(centerChannel);
  const hasBottom = Boolean(bottomChannel);
  const showDeckToggles = hasLeft || hasRight || hasCenter || hasBottom;

  return (
    <section className="edd-holo-rig holo-console-rig" aria-label={rigAria ?? caption}>
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
            <aside className="edd-holo-rig__rail edd-holo-rig__rail--left" aria-hidden="true">
              <div className="edd-holo-rig__ticks" />
              <div className="edd-holo-rig__led-column">
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={`led-l-${i}`} className="edd-holo-rig__led" />
                ))}
              </div>
            </aside>

            <div className={`edd-holo-glass edd-holo-glass--${displayOn ? "on" : "off"}`}>
              <div
                ref={lensRef}
                className="edd-holo-glass__lens"
                onPointerMove={onLensPointerMove}
                onPointerLeave={onLensPointerLeave}
              >
                <span className="edd-holo-glass__lens-rim" aria-hidden="true" />
                <span className="edd-holo-glass__lens-arc" aria-hidden="true" />
                <div className="edd-holo-glass__viewport">{viewport}</div>
                <span className="edd-holo-glass__shine" aria-hidden="true" />
                <span className="edd-holo-glass__tint" aria-hidden="true" />
                <span className="edd-holo-glass__scanlines" aria-hidden="true" />
                <span className="edd-holo-glass__noise" aria-hidden="true" />
                <span className="edd-holo-glass__chroma" aria-hidden="true" />
                <span className="edd-holo-glass__vignette" aria-hidden="true" />
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
              </div>
              <p className="edd-holo-glass__caption">{caption}</p>
            </div>

            <aside className="edd-holo-rig__rail edd-holo-rig__rail--right" aria-hidden="true">
              <div className="edd-holo-rig__dial">
                <span className="edd-holo-rig__dial-hand" />
              </div>
              <div className="edd-holo-rig__vents" />
              <div className="edd-holo-rig__screws">
                <span />
                <span />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <footer className="edd-holo-rig__footer">
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
          <button
            type="button"
            className="edd-holo-rig__power"
            aria-pressed={displayOn}
            onClick={() => onDisplayToggle?.(!displayOn)}
          >
            {displayOn ? standbyLabel : engageLabel}
          </button>
          {showReset && onReset ? (
            <button type="button" className="edd-holo-rig__reset" onClick={onReset}>
              {resetLabel}
            </button>
          ) : null}
        </div>
      </footer>
    </section>
  );
}
