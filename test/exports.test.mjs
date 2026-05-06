/**
 * Exports smoke test.
 *
 * Pins the public API surface of @twobitedd/console-network. Anyone
 * depending on the package can expect at least these names to exist.
 * A deleted or renamed export breaks this test, which is the point.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";

import * as api from "@twobitedd/console-network";

const REQUIRED_NAMES = [
  "HoloFrameConsole",
  "ConsoleHost",
  "ConsoleSlotProvider",
  "ViewportSlot",
  "LeftSlot",
  "RightSlot",
  "CenterSlot",
  "BottomSlot",
  "RailLeftSlot",
  "RailRightSlot",
  "RailDialSlot",
  "ConsoleSlots",
  "useConsoleChannels",
  "defineGameModule",
  "derivePlate",
  "identityFromDynamic",
  "DEFAULT_CONSOLE_IDENTITY",
  "pickConsoleIdentityFields",
  "usePrefersReducedMotion",
];

describe("exports", () => {
  test("exposes the documented public surface", () => {
    for (const name of REQUIRED_NAMES) {
      assert.ok(name in api, `expected export: ${name}`);
    }
  });

  test("all helpers are functions, all components are functions", () => {
    const mustBeFunction = [
      api.HoloFrameConsole,
      api.ConsoleHost,
      api.ConsoleSlotProvider,
      api.ViewportSlot,
      api.LeftSlot,
      api.RightSlot,
      api.CenterSlot,
      api.BottomSlot,
      api.RailLeftSlot,
      api.RailRightSlot,
      api.RailDialSlot,
      api.useConsoleChannels,
      api.defineGameModule,
      api.derivePlate,
      api.identityFromDynamic,
      api.pickConsoleIdentityFields,
      api.usePrefersReducedMotion,
    ];
    for (const fn of mustBeFunction) {
      assert.equal(typeof fn, "function");
    }
  });

  test("ConsoleSlots aggregator points at the slot components", () => {
    assert.equal(api.ConsoleSlots.Viewport, api.ViewportSlot);
    assert.equal(api.ConsoleSlots.Left, api.LeftSlot);
    assert.equal(api.ConsoleSlots.Right, api.RightSlot);
    assert.equal(api.ConsoleSlots.Center, api.CenterSlot);
    assert.equal(api.ConsoleSlots.Bottom, api.BottomSlot);
    assert.equal(api.ConsoleSlots.RailLeft, api.RailLeftSlot);
    assert.equal(api.ConsoleSlots.RailRight, api.RailRightSlot);
    assert.equal(api.ConsoleSlots.RailDial, api.RailDialSlot);
  });

  test("DEFAULT_CONSOLE_IDENTITY is frozen guest defaults", () => {
    assert.equal(typeof api.DEFAULT_CONSOLE_IDENTITY, "object");
    assert.ok(Object.isFrozen(api.DEFAULT_CONSOLE_IDENTITY));
    assert.equal(api.DEFAULT_CONSOLE_IDENTITY.isAuthenticated, false);
  });
});
