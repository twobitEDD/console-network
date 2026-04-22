/**
 * Dynamic.xyz identity adapter test.
 *
 * Validates that identityFromDynamic(ctx) produces a well-shaped
 * ConsoleIdentity regardless of how sparse or populated the input is.
 *
 * The point: modules never see Dynamic. They see the normalized shape.
 * If you swap to Privy / wagmi / whatever, write a similar adapter and
 * the modules don't change.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { identityFromDynamic } from "@twobitedd/console-network";

describe("identityFromDynamic", () => {
  test("handles an undefined / empty context", () => {
    const id = identityFromDynamic(undefined);
    assert.equal(id.isAuthenticated, false);
    assert.equal(id.handle, null);
    assert.equal(id.address, null);
    assert.equal(typeof id.signIn, "function");
    assert.equal(typeof id.signOut, "function");
  });

  test("isAuthenticated flips when a user is present", () => {
    const id = identityFromDynamic({ user: { alias: "pilot-42" } });
    assert.equal(id.isAuthenticated, true);
    assert.equal(id.handle, "pilot-42");
  });

  test("prefers alias > username > email > shortened address for handle", () => {
    const aliased   = identityFromDynamic({ user: { alias: "A", username: "B", email: "c@x" } });
    const usernamed = identityFromDynamic({ user: { username: "B", email: "c@x" } });
    const emailed   = identityFromDynamic({ user: { email: "c@example.com" } });
    const justWallet = identityFromDynamic({
      user: {},
      primaryWallet: { address: "0xAbCd1234ef567890deadbeefc0de1111f00dbabe" },
    });

    assert.equal(aliased.handle, "A");
    assert.equal(usernamed.handle, "B");
    assert.equal(emailed.handle, "c@example.com");
    assert.equal(justWallet.handle, "0xAbCd…babe");
  });

  test("address is taken from primaryWallet", () => {
    const id = identityFromDynamic({
      user: {},
      primaryWallet: { address: "0x0000000000000000000000000000000000001234" },
    });
    assert.equal(id.address, "0x0000000000000000000000000000000000001234");
  });

  test("address falls back to user.verifiedCredentials", () => {
    const id = identityFromDynamic({
      user: { verifiedCredentials: [{ format: "email" }, { address: "0xabc" }] },
    });
    assert.equal(id.address, "0xabc");
  });

  test("exposes the raw context in `extra` for provider-specific escape hatches", () => {
    const user = { alias: "A" };
    const primaryWallet = { address: "0xabc" };
    const id = identityFromDynamic({ user, primaryWallet });
    assert.equal(id.extra.user, user);
    assert.equal(id.extra.primaryWallet, primaryWallet);
  });

  test("signIn delegates to setShowAuthFlow(true); signOut to handleLogOut()", async () => {
    const calls = [];
    const ctx = {
      user: null,
      setShowAuthFlow: (v) => calls.push(["setShowAuthFlow", v]),
      handleLogOut:    ()  => calls.push(["handleLogOut"]),
    };
    const id = identityFromDynamic(ctx);
    await id.signIn();
    await id.signOut();
    assert.deepEqual(calls, [["setShowAuthFlow", true], ["handleLogOut"]]);
  });
});
