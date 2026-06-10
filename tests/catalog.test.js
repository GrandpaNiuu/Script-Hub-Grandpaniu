import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

test("模块目录只使用本仓库可安装的公开 URL", async () => {
  const raw = await readFile("docs/data/modules.json", "utf8");
  const catalog = JSON.parse(raw);
  const localModules = (await readdir("modules")).filter(file => file.endsWith(".sgmodule")).toSorted();

  assert.ok(Array.isArray(catalog.modules));
  assert.deepEqual(
    catalog.modules.map(item => item.url.split("/").pop()).toSorted(),
    localModules
  );

  const ids = new Set();
  for (const item of catalog.modules) {
    assert.equal(typeof item.id, "string");
    assert.equal(typeof item.name, "string");
    assert.equal(typeof item.url, "string");
    assert.match(item.url, /^https:\/\/raw\.githubusercontent\.com\/GrandpaNiuu\/Script-Hub-Grandpaniu\/main\/modules\/.+\.sgmodule$/);
    assert.equal(item.source, "GrandpaNiuu/Script-Hub-Grandpaniu");
    assert.equal(item.verified, true);
    assert.ok(!ids.has(item.id), `重复模块 ID: ${item.id}`);
    ids.add(item.id);
    new URL(item.url);
  }
});
