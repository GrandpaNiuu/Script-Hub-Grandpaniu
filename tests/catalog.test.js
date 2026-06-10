import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("模块目录收录公开仓库中的可转换模块 URL", async () => {
  const raw = await readFile("docs/data/modules.json", "utf8");
  const catalog = JSON.parse(raw);

  assert.ok(Array.isArray(catalog.modules));
  assert.ok(catalog.modules.length >= 1000, "公开模块索引数量过少，可能生成失败");
  assert.ok(Array.isArray(catalog.sourceRepositories));

  const ids = new Set();
  const urls = new Set();
  const convertTypes = new Set();
  for (const item of catalog.modules) {
    assert.equal(typeof item.id, "string");
    assert.equal(typeof item.name, "string");
    assert.equal(typeof item.url, "string");
    assert.match(item.url, /^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/.+\.(?:sgmodule|module|plugin|lpx|conf|list|ruleset|stoverride|ya?ml)$/);
    assert.match(item.source, /^[^/]+\/[^/]+$/);
    assert.equal(item.verified, true);
    assert.ok(!ids.has(item.id), `重复模块 ID: ${item.id}`);
    assert.ok(!urls.has(item.url), `重复模块 URL: ${item.url}`);
    ids.add(item.id);
    urls.add(item.url);
    convertTypes.add(item.convertType);
    new URL(item.url);
  }

  for (const type of ["surge-module", "qx-rewrite", "loon-plugin", "rule-set", "all-module"]) {
    assert.ok(convertTypes.has(type), `缺少转换类型: ${type}`);
  }
});
