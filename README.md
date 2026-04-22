# Console Network

Standalone monorepo for the Console Network ecosystem.

## What is here

- `package/` — publishable `@twobitedd/console-network` package
- `examples/demo/` — simple React demo using the package
- `registry/` — public manifest registry for themes and projects
- `scripts/` — registry build/validation scripts
- `test/` — smoke tests and usage examples
- `.github/` — contribution templates and CI workflow

## Quick start

```bash
npm install
npm run build:console
npm run test:network
npm run dev:demo
```

## Common commands

- `npm run build:console`
- `npm run dev:console`
- `npm run dev:demo`
- `npm run registry:validate`
- `npm run registry:build`
- `npm run registry:check`

## Publish package

From `package/`, publish `@twobitedd/console-network` to npm.
