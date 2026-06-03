import test from "node:test";
import assert from "node:assert/strict";
import {
  formatPayload,
  toRocketInstallPayload,
  toShadowrocketInstallPayload
} from "../src/converter.js";

test("builds configurable Shadowrocket install URL", () => {
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

test("builds native Shadowrocket module install URL", () => {
  const payload = toShadowrocketInstallPayload(
    {
      kind: "surge-module",
      name: "demo-module",
      sourcePath: "https://example.test/demo.sgmodule",
      metadata: {}
    },
    {
      sourceUrl: "https://example.test/demo.sgmodule"
    }
  );

  assert.equal(payload.params.module, "https://example.test/demo.sgmodule");
  assert.equal(
    payload.installUrl,
    "shadowrocket://install?module=https%3A%2F%2Fexample.test%2Fdemo.sgmodule"
  );
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
