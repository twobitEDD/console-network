import { JSDOM } from "jsdom";

const KEYS = [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "SVGElement",
  "customElements",
];

const ACT_ENV_KEY = "IS_REACT_ACT_ENVIRONMENT";

/**
 * Minimal browser-like globals for mounting {@link ConsoleHost} under node:test.
 * Always call `uninstall()` after each test (usually in `afterEach`).
 *
 * Node may define read-only globals such as `navigator`; we snapshot descriptors and restore them.
 *
 * @returns {{ container: HTMLElement, uninstall: () => void }}
 */
export function installJsdomConsoleEnv() {
  /** @type {Record<string, PropertyDescriptor|undefined>} */
  const prev = {};

  const prevAct = globalThis[ACT_ENV_KEY];
  globalThis[ACT_ENV_KEY] = true;

  const dom = new JSDOM(
    `<!DOCTYPE html><html><body><div id="cn-root"></div></body></html>`,
    { pretendToBeVisual: true, url: "http://localhost/" },
  );

  const win = dom.window;
  win.matchMedia = () => ({
    matches: false,
    media: "(prefers-reduced-motion: reduce)",
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return true;
    },
    onchange: null,
  });

  const next = {
    window: win,
    document: win.document,
    navigator: win.navigator,
    HTMLElement: win.HTMLElement,
    SVGElement: win.SVGElement,
    customElements: win.customElements,
  };

  for (const key of KEYS) {
    prev[key] = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      value: next[key],
      configurable: true,
      writable: true,
      enumerable: true,
    });
  }

  const container = win.document.getElementById("cn-root");
  if (!container) {
    throw new Error("jsdomConsoleEnv: missing #cn-root");
  }

  return {
    container,
    uninstall() {
      if (prevAct === undefined) {
        Reflect.deleteProperty(globalThis, ACT_ENV_KEY);
      } else {
        globalThis[ACT_ENV_KEY] = prevAct;
      }
      for (const key of KEYS) {
        const d = prev[key];
        try {
          if (d) {
            Object.defineProperty(globalThis, key, d);
          } else {
            Reflect.deleteProperty(globalThis, key);
          }
        } catch {
          Reflect.deleteProperty(globalThis, key);
        }
      }
    },
  };
}
