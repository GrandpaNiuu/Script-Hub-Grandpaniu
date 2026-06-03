import test from "node:test";
import assert from "node:assert/strict";
import {
  buildShadowrocketModule,
  parseModuleContent
} from "../src/module-parser.js";

test("解析并保留核心 Shadowrocket 模块段", () => {
  const parsed = parseModuleContent(`#\u0021name=Demo
[General]
bypass-system = true
[Header Rewrite]
^https://a.test header-reject
[URL Rewrite]
^https://b.test 302 https://c.test
[Body Rewrite]
^https://d.test response-body old new
[Script]
demo = type=http-request,pattern=^https://e.test,script-path=https://example.com/a.js
[MITM]
hostname = a.test, b.test
`);

  assert.equal(parsed.summary.General, 1);
  assert.equal(parsed.summary["Header Rewrite"], 1);
  assert.equal(parsed.summary["URL Rewrite"], 1);
  assert.equal(parsed.summary["Body Rewrite"], 1);
  assert.equal(parsed.summary.Script, 1);
  assert.equal(parsed.summary.MITM, 1);

  const output = buildShadowrocketModule(parsed);
  assert.match(output, /\[General\]/);
  assert.match(output, /\[Header Rewrite\]/);
  assert.match(output, /\[URL Rewrite\]/);
  assert.match(output, /\[Body Rewrite\]/);
  assert.match(output, /\[Script\]/);
  assert.match(output, /\[MITM\]/);
});
