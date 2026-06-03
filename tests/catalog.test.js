import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("模块目录使用可安装的公开 URL", async () => {
  const raw = await readFile("docs/data/modules.json", "utf8");
  const catalog = JSON.parse(raw);

  assert.ok(Array.isArray(catalog.modules));
  assert.ok(catalog.modules.length > 0);

  const ids = new Set();
  for (const item of catalog.modules) {
    assert.equal(typeof item.id, "string");
    assert.equal(typeof item.name, "string");
    assert.equal(typeof item.url, "string");
    assert.match(item.url, /^https:\/\/raw\.githubusercontent\.com\//);
    assert.ok(!ids.has(item.id), `重复模块 ID: ${item.id}`);
    ids.add(item.id);
    new URL(item.url);
  }
});
