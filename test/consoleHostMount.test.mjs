/**
 * Integration smoke tests for ConsoleHost + slots (jsdom).
 *
 * Covers presentation / visual tier / shell pin wiring without a browser harness.
 */
import { describe, test, afterEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

import { ConsoleHost, ConsoleSlots, defineGameModule } from "@twobitedd/console-network";
import { installJsdomConsoleEnv } from "./helpers/jsdomConsoleEnv.mjs";

/**
 * @param {(api: *) => import("react").ReactNode=} viewportInner
 */
function makeModule(viewportInner) {
  function Comp({ api }) {
    const inner =
      viewportInner?.(api) ?? React.createElement("span", null, api.presentation);
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        ConsoleSlots.Viewport,
        null,
        React.createElement("div", { id: "vp" }, inner),
      ),
      React.createElement(ConsoleSlots.Left, null, React.createElement("div", null, "L")),
      React.createElement(ConsoleSlots.Right, null, React.createElement("div", null, "R")),
      React.createElement(ConsoleSlots.Center, null, React.createElement("div", null, "C")),
      React.createElement(ConsoleSlots.Bottom, null, React.createElement("div", null, "B")),
    );
  }

  return defineGameModule({
    id: "mount-test-module",
    title: "Mount Test",
    Component: Comp,
  });
}

describe("ConsoleHost (jsdom)", () => {
  /** @type {import('react-dom/client').Root | null} */
  let root = null;
  /** @type {{ container: HTMLElement, uninstall: () => void } | undefined} */
  let env;

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
      root = null;
    }
    env?.uninstall();
    env = undefined;
  });

  test("default presentation exposes api.presentation in the viewport", async () => {
    env = installJsdomConsoleEnv();
    root = createRoot(env.container);
    const mod = makeModule();

    await act(async () => {
      root.render(React.createElement(ConsoleHost, { module: mod }));
    });

    assert.equal(env.container.querySelector("#vp span")?.textContent, "default");
    assert.ok(!env.container.querySelector(".edd-console-host--immersive"));
  });

  test("immersive adds host + rig chrome classes", async () => {
    env = installJsdomConsoleEnv();
    root = createRoot(env.container);
    const mod = makeModule();

    await act(async () => {
      root.render(
        React.createElement(ConsoleHost, { module: mod, presentation: "immersive" }),
      );
    });

    assert.ok(env.container.querySelector(".edd-console-host--immersive"));
    assert.ok(env.container.querySelector(".edd-holo-rig--immersive"));
    assert.ok(
      env.container.querySelector(".edd-holo-glass__lens .edd-holo-rig__immersive-edge"),
      "immersive edge should stack inside the lens below overlays",
    );
    assert.equal(env.container.querySelector("#vp span")?.textContent, "immersive");
  });

  test("visualTier extra renders static TV lens overlays (no pointer-driven glare)", async () => {
    env = installJsdomConsoleEnv();
    root = createRoot(env.container);
    const mod = makeModule(() => null);

    await act(async () => {
      root.render(
        React.createElement(ConsoleHost, {
          module: mod,
          visualTier: "extra",
          effects: "full",
          respectReducedMotion: false,
        }),
      );
    });

    assert.ok(env.container.querySelector(".edd-holo-rig--tier-extra"));
    assert.ok(env.container.querySelector(".edd-holo-glass__lens-breathe-layer"));
    assert.ok(env.container.querySelector(".edd-holo-glass__lens-prism"));
    assert.equal(env.container.querySelector(".edd-holo-glass__lens-reactive"), null);
  });

  test("visualTier potato skips extra lens overlays", async () => {
    env = installJsdomConsoleEnv();
    root = createRoot(env.container);
    const mod = makeModule(() => null);

    await act(async () => {
      root.render(
        React.createElement(ConsoleHost, {
          module: mod,
          visualTier: "potato",
        }),
      );
    });

    assert.ok(env.container.querySelector(".edd-holo-rig--tier-potato"));
    assert.equal(env.container.querySelector(".edd-holo-glass__lens-breathe-layer"), null);
    assert.equal(env.container.querySelector(".edd-holo-glass__lens-prism"), null);
  });

  test("api.shell.setImmersiveDeckPinned pins the footer in immersive mode", async () => {
    env = installJsdomConsoleEnv();
    root = createRoot(env.container);
    const mod = makeModule((api) =>
      React.createElement(
        "button",
        {
          type: "button",
          id: "pin-btn",
          onClick: () => api.shell?.setImmersiveDeckPinned(true),
        },
        "pin",
      ),
    );

    await act(async () => {
      root.render(
        React.createElement(ConsoleHost, {
          module: mod,
          presentation: "immersive",
        }),
      );
    });

    await act(async () => {
      const reveal = env.container.querySelector('[aria-label="Show console deck"]');
      assert.ok(reveal, "immersive deck should start hidden until revealed");
      reveal.click();
    });

    assert.equal(env.container.querySelector(".edd-holo-rig__footer.is-peek-pinned"), null);

    await act(async () => {
      env.container.querySelector("#pin-btn").click();
    });

    assert.ok(env.container.querySelector(".edd-holo-rig__footer.is-peek-pinned"));
  });
});
