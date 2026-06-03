# Roadmap

## Near Term

- Confirm the exact install payload schema expected by Script Hub maintainers.
- Add fixtures for real-world public plugin/module manifests.
- Add a release checklist that verifies authorization wording before publishing.
- Add source URL templating for recursive scans, such as `{path}` replacement.

## Later

- Add optional validation rules per target tool.
- Add a web or browser-extension entrypoint if the CLI flow proves useful.
- Add signed release artifacts if the adapter becomes widely shared.

## Boundaries

- Do not copy Script Hub private code, private APIs, bundled script resources, or
  paid assets.
- Keep the project described as independent unless upstream maintainers grant
  official or built-in status separately.
- Keep authorization updates recorded in `docs/authorization.md`.
