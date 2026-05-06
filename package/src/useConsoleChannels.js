import { useCallback, useMemo, useState } from "react";

/**
 * Headless state hook for the four-channel console shell. Returns open flags
 * plus setters that a module or host can wire into <HoloFrameConsole/>'s
 * controlled props, or use imperatively via the ConsoleChannelApi handed to
 * GameModule.mount().
 *
 * Defaults follow the "supreme viewport" design language:
 *  - side rails and center modal start closed
 *  - bottom HUD starts open
 *
 * @param {{ left?:boolean, right?:boolean, center?:boolean, bottom?:boolean }} [initial]
 */
export function useConsoleChannels(initial = {}) {
  const [leftOpen, setLeft] = useState(initial.left ?? false);
  const [rightOpen, setRight] = useState(initial.right ?? false);
  const [centerOpen, setCenter] = useState(initial.center ?? false);
  const [bottomOpen, setBottom] = useState(initial.bottom ?? true);
  const [power, setPower] = useState(true);
  const [immersiveDeckPinned, setImmersiveDeckPinned] = useState(false);
  /** When presentation is `immersive`, deck/chrome starts hidden; edge buttons reveal it. */
  const [immersiveChromeRevealed, setImmersiveChromeRevealed] = useState(false);

  const api = useMemo(
    () => ({
      setLeft: (next) => setLeft(Boolean(next)),
      setRight: (next) => setRight(Boolean(next)),
      setCenter: (next) => setCenter(Boolean(next)),
      setBottom: (next) => setBottom(Boolean(next)),
      setPower: (next) => setPower(Boolean(next)),
    }),
    [],
  );

  const toggle = useCallback((channel) => {
    switch (channel) {
      case "left": setLeft((v) => !v); break;
      case "right": setRight((v) => !v); break;
      case "center": setCenter((v) => !v); break;
      case "bottom": setBottom((v) => !v); break;
      case "power": setPower((v) => !v); break;
      default: break;
    }
  }, []);

  const state = useMemo(
    () => ({ leftOpen, rightOpen, centerOpen, bottomOpen, power }),
    [leftOpen, rightOpen, centerOpen, bottomOpen, power],
  );

  const set = useMemo(
    () => ({
      setLeft: (next) => setLeft(Boolean(next)),
      setRight: (next) => setRight(Boolean(next)),
      setCenter: (next) => setCenter(Boolean(next)),
      setBottom: (next) => setBottom(Boolean(next)),
      setPower: (next) => setPower(Boolean(next)),
    }),
    [],
  );

  const shell = useMemo(
    () => ({
      immersiveDeckPinned,
      setImmersiveDeckPinned: (next) => setImmersiveDeckPinned(Boolean(next)),
      immersiveChromeRevealed,
      setImmersiveChromeRevealed: (next) => setImmersiveChromeRevealed(Boolean(next)),
    }),
    [immersiveDeckPinned, immersiveChromeRevealed],
  );

  return {
    state,
    set,
    api,
    toggle,
    shell,
  };
}
