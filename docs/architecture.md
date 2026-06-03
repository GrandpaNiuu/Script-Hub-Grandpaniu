# Architecture

The adapter is split into two small layers.

## Detection

`src/detectors.js` turns a local path into normalized module metadata.

Supported sources:

- `.codex-plugin/plugin.json`
- `SKILL.md`
- MCP config JSON with `mcpServers`
- generic JSON manifests with `name` or `id`

`discoverModules(path, { recursive: true })` walks directories and returns every
supported module it can identify, skipping build and dependency directories.

## Conversion

`src/converter.js` turns normalized metadata into an install payload:

- `params`: normalized key/value fields
- `installUrl`: configured install base plus encoded query parameters
- `module`: original normalized metadata

The converter intentionally does not copy Script Hub internals. The install base
and additional parameters are caller-provided so the project can adapt to future
Script Hub guidance without hard-coding private behavior.

## CLI

`src/cli.js` wires discovery and conversion together.

Useful output modes:

- `json` for inspection and automation
- `url` for direct install links
- `params` for embedding into another tool
