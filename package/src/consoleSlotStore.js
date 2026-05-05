/**
 * Mutable slot map + listener list so slot registration can update the holo shell
 * without React state on {@link ConsoleHost}. That avoids re-rendering the game
 * module on every slot tick (new element references each render), which together
 * with useLayoutEffect previously blew the max update depth (React #185).
 */
export function createConsoleSlotStore() {
  let slots = newEmptySlots();
  const listeners = new Set();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return slots;
    },
    register(channel, key, node) {
      const prevChannel = slots[channel] ?? {};
      if (prevChannel[key] === node) return;
      slots = { ...slots, [channel]: { ...prevChannel, [key]: node } };
      listeners.forEach((l) => l());
    },
    unregister(channel, key) {
      const prevChannel = slots[channel];
      if (!prevChannel || !(key in prevChannel)) return;
      const nextChannel = { ...prevChannel };
      delete nextChannel[key];
      slots = { ...slots, [channel]: nextChannel };
      listeners.forEach((l) => l());
    },
  };
}

function newEmptySlots() {
  return {
    viewport: {},
    left: {},
    right: {},
    center: {},
    bottom: {},
  };
}
