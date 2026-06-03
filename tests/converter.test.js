import test from "node:test";
import assert from "node:assert/strict";
import { toRocketInstallPayload } from "../src/converter.js";

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
