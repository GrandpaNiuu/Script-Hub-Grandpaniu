import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseModuleContent } from "../src/module-parser.js";

test("增强模块包含 Script-Hub 官方脚本引用和关键段", async () => {
  const content = await readFile("modules/script-hub-grandpaniu.sgmodule", "utf8");
  const parsed = parseModuleContent(content);

  assert.ok(parsed.summary.General > 0);
  assert.ok(parsed.summary["Header Rewrite"] > 0);
  assert.ok(parsed.summary["URL Rewrite"] >= 4);
  assert.ok(parsed.summary["Body Rewrite"] > 0);
  assert.ok(parsed.summary.Script >= 5);
  assert.ok(parsed.summary.MITM > 0);

  assert.match(content, /Script-Hub-Org\/Script-Hub\/main\/script-hub\.js/);
  assert.match(content, /Rewrite-Parser\.js/);
  assert.match(content, /rule-parser\.js/);
  assert.match(content, /script-converter\.js/);
  assert.match(content, /type%3Dqx-rewrite/);
  assert.match(content, /type%3Dsurge-module/);
  assert.match(content, /type%3Dloon-plugin/);
  assert.match(
    content,
    /force-http-engine-hosts = %APPEND% script\.hub, \*\.script\.hub, grandpaniu\.script\.hub, grandpaniu\.script-hub\.local/
  );
  assert.match(
    content,
    /hostname = %APPEND% script\.hub, \*\.script\.hub, hub\.kelee\.one, pluginhub\.kelee\.one, kelee\.one, grandpaniu\.script\.hub, grandpaniu\.script-hub\.local/
  );
});
