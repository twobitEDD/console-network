# Projects

One folder per project. Folder name must equal the project's `id`.

Required files:
- `project.json` — manifest ([schema](../_schema/project.schema.json))

Recommended files:
- `cover.png` — 1200×630, hero card image used in the Connections panel
- `icon.png` — 256×256 square, used in list views
- `README.md` — longer description, screenshots, changelog

See `_template/` for a minimal starting point.

Projects do **not** need to run `@twobitedd/console-network` to be listed — set `"usesConsoleNetwork": false` and the UI will still list your project, just flagged as "adjacent." The registry's purpose is to help people find each other; adoption of the framework is a separate conversation.
