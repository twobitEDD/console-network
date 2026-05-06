import { useCallback, useRef, useState } from "react";

function clampDeg(n) {
  let x = n % 360;
  if (x < 0) x += 360;
  return x;
}

/**
 * Draggable / wheelable dial — drives rotation on the salvage-rig hand.
 * Reports changes via `onRotationChange` (e.g. `emit('chrome:dial', payload)`).
 */
export default function InteractiveDial({
  defaultRotationDeg = 32,
  onRotationChange,
  motionReduced = false,
  labelledBy,
}) {
  const dialRef = useRef(null);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(defaultRotationDeg);

  const publish = useCallback(
    (nextDeg) => {
      const d = clampDeg(nextDeg);
      setRotationDeg(d);
      onRotationChange?.({
        degrees: d,
        normalized: d / 360,
      });
    },
    [onRotationChange],
  );

  const angleFromPointer = useCallback((event) => {
    const el = dialRef.current;
    if (!el) return defaultRotationDeg;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const rad = Math.atan2(dy, dx);
    const deg = (rad * 180) / Math.PI + 90;
    return clampDeg(deg);
  }, [defaultRotationDeg]);

  const onPointerDown = useCallback(
    (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      draggingRef.current = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      publish(angleFromPointer(event));
    },
    [angleFromPointer, publish],
  );

  const onPointerMove = useCallback(
    (event) => {
      if (!draggingRef.current) return;
      publish(angleFromPointer(event));
    },
    [angleFromPointer, publish],
  );

  const endDrag = useCallback((event) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const bump = useCallback(
    (delta) => {
      setRotationDeg((prev) => {
        const next = clampDeg(prev + delta);
        onRotationChange?.({
          degrees: next,
          normalized: next / 360,
        });
        return next;
      });
    },
    [onRotationChange],
  );

  const onWheel = useCallback(
    (event) => {
      event.preventDefault();
      const step = motionReduced ? (event.deltaY > 0 ? 6 : -6) : event.deltaY > 0 ? 14 : -14;
      bump(step);
    },
    [bump, motionReduced],
  );

  return (
    <div
      ref={dialRef}
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(rotationDeg)}
      aria-labelledby={labelledBy}
      aria-label="Console dial"
      className="edd-holo-rig__dial edd-holo-rig__dial--interactive"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onWheel={onWheel}
      onKeyDown={(e) => {
        const step = motionReduced ? 6 : 12;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          bump(step);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          bump(-step);
        }
      }}
    >
      <span
        className="edd-holo-rig__dial-hand"
        aria-hidden="true"
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          transition:
            motionReduced || dragging ? undefined : "transform 0.12s ease-out",
        }}
      />
    </div>
  );
}
