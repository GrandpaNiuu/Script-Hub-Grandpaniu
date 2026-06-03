# Usage

## Detect One Manifest

```bash
node src/cli.js examples/codex-plugin \
  --source-url https://example.test/.codex-plugin/plugin.json
```

## Print Only The Install URL

```bash
node src/cli.js examples/skill \
  --source-url https://example.test/SKILL.md \
  --format url
```

## Discover A Directory

```bash
node src/cli.js examples \
  --source-url https://example.test/modules \
  --recursive
```

## Add Extra Parameters

```bash
node src/cli.js examples/skill \
  --source-url https://example.test/SKILL.md \
  --param channel=stable \
  --param publisher=GrandpaNiu
```

## Output Formats

- `json`: full payload, suitable for inspection and logs
- `url`: install URL only, suitable for copy/paste
- `params`: URL query string only, suitable for embedding into another tool
