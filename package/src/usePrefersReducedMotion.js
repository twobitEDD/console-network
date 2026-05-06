import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange) {
  const mq = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia(QUERY)
    : null;
  if (!mq) {
    return () => {};
  }
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

/**
 * @returns {boolean} true when the user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);
}
