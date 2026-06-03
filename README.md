# Script Hub Rocket Adapter

Prototype module for detecting tool modules/plugins and converting them into a
configurable rocket-install request.

The adapter is intentionally conservative: it recognizes public manifest shapes,
normalizes metadata, and emits install payloads. It does not bundle Script Hub or
third-party content without permission.

## Supported detection

- Codex plugin manifests: `.codex-plugin/plugin.json`
- Skill manifests: `SKILL.md`
- MCP-style server config snippets
- Generic JSON plugin/module manifests with `name`, `version`, and `description`

## CLI

```bash
npm test
node src/cli.js ./path/to/plugin --source-url https://example.com/plugin.json
```

Optional:

```bash
node src/cli.js ./path/to/plugin \
  --source-url https://example.com/plugin.json \
  --install-base shadowrocket://install
```

## Script Hub Authorization Notice

If this adapter is built into Script Hub or distributed as an official Script Hub
module, the maintainer should obtain permission from the relevant Script Hub
rights holder first. If formal permission is not yet available, the project must
at minimum carry a clear declaration that it is an independent compatibility
prototype and does not bundle Script Hub code or assets.

- `NOTICE.md`
- `docs/authorization.md`
- `docs/statement.zh-CN.md`

Until authorization is recorded, the adapter should be presented as an
independent compatibility tool, not an official Script Hub module.
