/**
 * Static surface checks: CSS classes + contract strings stay present after refactors.
 * Complements jsdom mount tests (consoleHostMount.test.mjs).
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const stylesPath = join(repoRoot, "package/src/styles.css");
const contractsPath = join(repoRoot, "package/src/contracts.js");
const holoPath = join(repoRoot, "package/src/HoloFrameConsole.jsx");
const hostPath = join(repoRoot, "package/src/ConsoleHost.jsx");

describe("feature surface (static)", () => {
  test("styles expose immersive + tier + lens motion hooks", () => {
    const css = readFileSync(stylesPath, "utf8");
    for (const needle of [
      ".edd-console-host--immersive",
      ".edd-holo-rig--immersive",
      ".edd-holo-rig--tier-potato",
      ".edd-holo-rig--tier-extra",
      ".edd-holo-glass__lens-breathe-layer",
      ".edd-holo-glass__lens-prism",
      ".edd-holo-rig__immersive-edge-btn--fullscreen",
      ".edd-holo-rig__footer.is-peek-pinned",
      "--edd-scan-mul",
      "@keyframes edd-crt-power-off",
      "--holo-frame-list-bg",
      "--holo-channel-fg",
    ]) {
      assert.ok(css.includes(needle), `expected styles.css to contain ${needle}`);
    }
  });

  test("contracts document shell + presentation on api", () => {
    const src = readFileSync(contractsPath, "utf8");
    assert.ok(src.includes("immersiveDeckPinned"));
    assert.ok(src.includes("setImmersiveDeckPinned"));
    assert.ok(src.includes("ConsoleShellApi"));
    assert.ok(src.includes("presentation"));
    assert.ok(src.includes("immersive"));
  });

  test("ConsoleHost accepts presentation + visualTier", () => {
    const src = readFileSync(hostPath, "utf8");
    assert.ok(src.includes('presentation = "default"'));
    assert.ok(src.includes('visualTier = "balanced"'));
    assert.ok(src.includes('presentation: immersive ? "immersive" : "default"'));
  });

  test("HoloFrame wires immersive dock + tier extras + fullscreen edge", () => {
    const src = readFileSync(holoPath, "utf8");
    assert.ok(src.includes("edd-holo-glass__viewport-surface"));
    assert.ok(src.includes("edd-holo-rig__immersive-dock"));
    assert.ok(src.includes("immersiveDeckPinned"));
    assert.ok(src.includes("edd-holo-glass__lens-breathe-layer"));
    assert.ok(src.includes("onImmersivePresentationFullscreen"));
  });
});
