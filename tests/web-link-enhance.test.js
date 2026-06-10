import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const scriptPath = "scripts/web-link-enhance-20260604.js";

async function runEnhancer({ url, body, contentType = "text/html; charset=utf-8" }) {
  const script = await readFile(scriptPath, "utf8");
  let output;
  const context = {
    URL,
    URLSearchParams,
    $request: { url, method: "GET" },
    $response: { headers: { "content-type": contentType, "content-length": String(body.length) }, body },
    $done(value) { output = value; }
  };
  vm.runInNewContext(script, context, { filename: scriptPath });
  return output.response.body;
}

test("网页增强脚本识别当前页面 URL 中的跳转参数", async () => {
  const body = "<html><body><p>redirect page</p></body></html>";
  const pageUrl = "https://example.test/go?target=https%253A%252F%252Fcdn.example.test%252Fdemo.sgmodule";
  const output = await runEnhancer({ url: pageUrl, body });

  assert.match(output, /grandpaniu-web-addon-panel/);
  assert.match(output, /https:\/\/cdn\.example\.test\/demo\.sgmodule/);
  assert.match(output, /page-url-param/);
});

test("网页增强脚本识别 meta refresh 和 JS location 跳转", async () => {
  const body = `
    <html>
      <head><meta http-equiv="refresh" content="0;url=https%3A%2F%2Fcdn.example.test%2Fqx.conf"></head>
      <body>
        <script>window.location = "https://cdn.example.test/demo.plugin";</script>
      </body>
    </html>`;
  const output = await runEnhancer({ url: "https://example.test/page", body });

  assert.match(output, /https:\/\/cdn\.example\.test\/qx\.conf/);
  assert.match(output, /https:\/\/cdn\.example\.test\/demo\.plugin/);
  assert.match(output, /qx-rewrite/);
  assert.match(output, /loon-plugin/);
});

test("网页增强脚本识别按钮属性里的跳转模块链接", async () => {
  const body = `
    <html><body>
      <button data-url="https://example.test/redirect?url=https%253A%252F%252Fcdn.example.test%252Fdemo.lpx">Install</button>
    </body></html>`;
  const output = await runEnhancer({ url: "https://example.test/page", body });

  assert.match(output, /https:\/\/cdn\.example\.test\/demo\.lpx/);
  assert.match(output, /loon-plugin/);
});
