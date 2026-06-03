import test from "node:test";
import assert from "node:assert/strict";
import { formatPayload, toRocketInstallPayload } from "../src/converter.js";

test("builds configurable rocket install URL", () => {
  const payload = toRocketInstallPayload(
    {
      kind: "generic-plugin",
      name: "demo",
      version: "1.2.3",
      description: "Demo plugin",
      sourcePath: "package.json",
      metadata: {}
    },
    {
      sourceUrl: "https://example.test/plugin.json",
      installBase: "shadowrocket://install"
    }
  );

  assert.equal(payload.module.name, "demo");
  assert.match(payload.installUrl, /^shadowrocket:\/\/install\?/);
  assert.match(payload.installUrl, /name=demo/);
  assert.match(payload.installUrl, /kind=generic-plugin/);
  assert.match(payload.installUrl, /version=1.2.3/);
});

test("formats payload as URL and params", () => {
  const payload = toRocketInstallPayload(
    {
      kind: "skill",
      name: "demo-skill",
      sourcePath: "SKILL.md",
      metadata: {}
    },
    {
      sourceUrl: "https://example.test/SKILL.md",
      extraParams: { channel: "stable" }
    }
  );

  assert.equal(formatPayload(payload, "url"), payload.installUrl);
  assert.match(formatPayload(payload, "params"), /channel=stable/);
  assert.match(formatPayload(payload, "json"), /"name": "demo-skill"/);
});
