# Script-Hub-Grandpaniu

Script Hub Rocket Adapter

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

## Library API

```js
import {
  discoverModules,
  toRocketInstallPayload
} from "script-hub-rocket-adapter";

const modules = await discoverModules("./examples", { recursive: true });
const payloads = modules.map((module) =>
  toRocketInstallPayload(module, {
    sourceUrl: "https://example.com/modules",
    installBase: "rocket://install"
  })
);
```

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

Recursive discovery:

```bash
node src/cli.js examples --recursive \
  --source-url https://example.com/modules \
  --format url
```

More examples are in `docs/usage.md`.

## Project Notes

- `docs/architecture.md` explains the detection/conversion split.
- `docs/roadmap.md` tracks useful next steps.
- `docs/authorization.md` records the upstream Script Hub permission issue.

## Script Hub Authorization Notice

The upstream Script Hub maintainer has publicly allowed continued development in
the permission request issue:

https://github.com/Script-Hub-Org/Script-Hub/issues/56

- `NOTICE.md`
- `docs/authorization.md`
- `docs/statement.zh-CN.md`

This project remains an independent compatibility tool. The authorization record
does not grant official endorsement, trademark rights, or permission to copy
private/non-public Script Hub assets unless those permissions are granted
separately.
