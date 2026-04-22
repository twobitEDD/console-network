/**
 * Registry smoke test.
 *
 * Confirms the committed registry/index.json is coherent: every manifest
 * on disk validates against its schema, folder names match ids, and the
 * generated file reflects the current state of the tree.
 *
 * This is what the GitHub workflow runs, minus the --check step.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildIndex,
  discoverEntries,
  loadManifest,
  loadSchema,
  validate,
} from "../scripts/registry-lib.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("registry", () => {
  test("every theme manifest validates", async () => {
    const schema = await loadSchema(repoRoot, "theme");
    const entries = await discoverEntries(repoRoot, "themes");
    assert.ok(entries.length > 0, "expected at least one theme registered");
    for (const entry of entries) {
      const manifest = await loadManifest(entry.manifestPath);
      const errors = validate(manifest, schema);
      assert.deepEqual(errors, [], `theme "${entry.slug}" failed schema: ${errors.join("; ")}`);
      assert.equal(manifest.id, entry.slug, `theme folder "${entry.slug}" must match manifest.id`);
    }
  });

  test("every project manifest validates", async () => {
    const schema = await loadSchema(repoRoot, "project");
    const entries = await discoverEntries(repoRoot, "projects");
    assert.ok(entries.length > 0, "expected at least one project registered");
    for (const entry of entries) {
      const manifest = await loadManifest(entry.manifestPath);
      const errors = validate(manifest, schema);
      assert.deepEqual(errors, [], `project "${entry.slug}" failed schema: ${errors.join("; ")}`);
      assert.equal(manifest.id, entry.slug, `project folder "${entry.slug}" must match manifest.id`);
    }
  });

  test("buildIndex produces no errors", async () => {
    const { errors, index } = await buildIndex(repoRoot, { generatedAt: "X" });
    assert.deepEqual(errors, [], errors.join("\n"));
    assert.equal(index.version, 1);
    assert.ok(Array.isArray(index.themes));
    assert.ok(Array.isArray(index.projects));
  });

  test("committed registry/index.json matches the generator", async () => {
    const { index } = await buildIndex(repoRoot, { generatedAt: "FROZEN-FOR-DIFF" });
    const committed = await readFile(resolve(repoRoot, "registry/index.json"), "utf8");
    const normalized = committed.replace(/"generatedAt":\s*"[^"]*"/, '"generatedAt": "FROZEN-FOR-DIFF"');
    const expected = JSON.stringify(index, null, 2) + "\n";
    assert.equal(
      normalized,
      expected,
      "registry/index.json is stale — run `node scripts/build-registry.mjs`",
    );
  });

  test("no duplicate ids across themes or projects", async () => {
    const { index } = await buildIndex(repoRoot, { generatedAt: "X" });
    const themeIds = index.themes.map((t) => t.id);
    const projectIds = index.projects.map((p) => p.id);
    assert.equal(new Set(themeIds).size, themeIds.length, "duplicate theme id");
    assert.equal(new Set(projectIds).size, projectIds.length, "duplicate project id");
  });

  test("validator rejects obviously bad input", async () => {
    const schema = await loadSchema(repoRoot, "theme");
    const errors = validate({ id: "X", name: "z" }, schema);
    assert.ok(errors.length > 0, "expected errors for a clearly invalid manifest");
  });
});
