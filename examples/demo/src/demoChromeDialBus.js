/** Tiny external store so DemoGame can read rig dial turns passed via ConsoleHost `onChromeDial`. */

let snapshot = null;
const listeners = new Set();

export function subscribeDemoChromeDial(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getDemoChromeDialSnapshot() {
  return snapshot;
}

export function setDemoChromeDialSnapshot(next) {
  snapshot = next;
  for (const l of listeners) l();
}
