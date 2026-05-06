/**
 * @file consoleIdentity.test.mjs
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_CONSOLE_IDENTITY,
  pickConsoleIdentityFields,
} from "@twobitedd/console-network";

describe("pickConsoleIdentityFields", () => {
  test("fills defaults for empty input", () => {
    const got = pickConsoleIdentityFields(undefined);
    assert.equal(got.isAuthenticated, false);
    assert.equal(got.handle, null);
    assert.equal(got.address, null);
    assert.equal(got.extra, undefined);
  });

  test("normalizes primitives", () => {
    const got = pickConsoleIdentityFields({
      isAuthenticated: 1,
      handle: "x",
      address: "0xabc",
      extra: { a: 1 },
    });
    assert.equal(got.isAuthenticated, true);
    assert.equal(got.handle, "x");
    assert.equal(got.address, "0xabc");
    assert.deepEqual(got.extra, { a: 1 });
  });
});

describe("DEFAULT_CONSOLE_IDENTITY", () => {
  test("matches guest defaults", () => {
    assert.deepEqual(
      { ...DEFAULT_CONSOLE_IDENTITY },
      { isAuthenticated: false, handle: null, address: null },
    );
  });
});
