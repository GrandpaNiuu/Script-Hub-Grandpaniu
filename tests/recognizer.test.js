import test from "node:test";
import assert from "node:assert/strict";
import { recognizeExternalModule } from "../src/recognizer.js";

test("recognizes Loon plugin URLs", () => {
  const module = recognizeExternalModule({
    sourceUrl: "https://example.test/demo.plugin"
  });

  assert.equal(module.kind, "loon-plugin");
  assert.equal(module.name, "demo");
});

test("recognizes Surge and Shadowrocket modules by content", () => {
  const module = recognizeExternalModule({
    sourceUrl: "https://example.test/raw",
    content: "#!name=Demo Module\n[Script]\n"
  });

  assert.equal(module.kind, "surge-module");
  assert.equal(module.name, "Demo Module");
});

test("recognizes Codex plugin manifests by JSON content", () => {
  const module = recognizeExternalModule({
    sourceUrl: "https://example.test/plugin.json",
    content: JSON.stringify({ name: "demo-codex-plugin", version: "0.1.0" })
  });

  assert.equal(module.kind, "generic-plugin");
  assert.equal(module.name, "demo-codex-plugin");
});
