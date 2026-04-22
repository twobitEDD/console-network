/**
 * Contracts test.
 *
 * Exercises the author-facing helpers: defineGameModule (validation rules)
 * and derivePlate (default plate metadata).
 *
 * If you're reading this to learn the API, the happy-path block near the
 * top is the entire authoring pattern.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { defineGameModule, derivePlate } from "@twobitedd/console-network";

const NoopComponent = () => null;

describe("defineGameModule", () => {
  test("accepts a valid module", () => {
    const mod = defineGameModule({
      id: "my-game",
      title: "My Game",
      version: "1.0.0",
      Component: NoopComponent,
    });
    assert.equal(mod.id, "my-game");
    assert.equal(mod.title, "My Game");
    assert.equal(typeof mod.Component, "function");
  });

  test("is a pure pass-through (returns the same object reference)", () => {
    const input = { id: "x", title: "X", Component: NoopComponent };
    const output = defineGameModule(input);
    assert.equal(output, input);
  });

  test("rejects missing id", () => {
    assert.throws(
      () => defineGameModule({ title: "X", Component: NoopComponent }),
      /`id` is required/,
    );
  });

  test("rejects missing title", () => {
    assert.throws(
      () => defineGameModule({ id: "x", Component: NoopComponent }),
      /`title` is required/,
    );
  });

  test("rejects non-function Component", () => {
    assert.throws(
      () => defineGameModule({ id: "x", title: "X", Component: "not a fn" }),
      /`Component` must be a React component/,
    );
  });

  test("rejects non-object input", () => {
    assert.throws(() => defineGameModule(null), /module must be an object/);
    assert.throws(() => defineGameModule(42),   /module must be an object/);
  });
});

describe("derivePlate", () => {
  test("derives plateId from the module id", () => {
    const plate = derivePlate({ id: "super-tic-tac-toe", title: "STTT", Component: NoopComponent });
    assert.equal(plate.plateId, "SUPER-TIC-TAC-TOE");
  });

  test("plateId sanitizes non-alphanumerics and caps length", () => {
    const plate = derivePlate({
      id: "an/extremely_long_module:identifier-string",
      title: "X",
      Component: NoopComponent,
    });
    assert.match(plate.plateId, /^[A-Z0-9-]+$/);
    assert.ok(plate.plateId.length <= 18, `expected <=18 chars, got ${plate.plateId.length}`);
  });

  test("uses version to compose plateRev", () => {
    const plate = derivePlate({ id: "x", title: "X", version: "2.1.3", Component: NoopComponent });
    assert.equal(plate.plateRev, "REV 2.1.3");
  });

  test("plateRev falls back to 'REV 0.1' when no version", () => {
    const plate = derivePlate({ id: "x", title: "X", Component: NoopComponent });
    assert.equal(plate.plateRev, "REV 0.1");
  });

  test("caption falls back to title", () => {
    const plate = derivePlate({ id: "x", title: "Neon Arcade", Component: NoopComponent });
    assert.equal(plate.caption, "Neon Arcade");
  });

  test("plate overrides from module.plate win", () => {
    const plate = derivePlate({
      id: "x",
      title: "X",
      plate: { plateId: "CUSTOM", plateRev: "alpha", caption: "A Custom Caption", sticker: "β" },
      Component: NoopComponent,
    });
    assert.equal(plate.plateId, "CUSTOM");
    assert.equal(plate.plateRev, "alpha");
    assert.equal(plate.caption, "A Custom Caption");
    assert.equal(plate.sticker, "β");
  });

  test("sticker defaults to null when not provided", () => {
    const plate = derivePlate({ id: "x", title: "X", Component: NoopComponent });
    assert.equal(plate.sticker, null);
  });
});
