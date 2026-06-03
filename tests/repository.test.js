import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const textFiles = [
  "README.md",
  "NOTICE.md",
  "docs/usage.md",
  "docs/architecture.md",
  "docs/authorization.md",
  "docs/roadmap.md",
  "docs/statement.zh-CN.md",
  "docs/index.html",
  "docs/redirect.html",
  "docs/grandpa-niu.html",
  "modules/script-hub-grandpaniu.sgmodule",
  "scripts/script-hub-grandpaniu-enhance.js"
];
const conflictMarker = "<" + "<<<<<<";
const mainInstallUrl = "shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule";
const webInstallUrl = "https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/grandpa-niu.html";

test("仓库文档没有乱码、冲突标记或截断链接", async () => {
  for (const file of textFiles) {
    const content = await readFile(file, "utf8");
    assert.equal(content.includes(conflictMarker), false, `${file} 存在冲突标记`);
    assert.equal(content.includes("\uFFFD"), false, `${file} 存在替换字符`);
    assert.equal(/[\u93C4\uE21C\u6F61\u9366\u6D93]/.test(content), false, `${file} 疑似中文乱码`);
    assert.equal(/script-hub-grandpaniu\.\s*$/m.test(content), false, `${file} 存在截断模块链接`);
  }
});

test("仓库包含不自动创建 Pages 站点的部署 workflow", async () => {
  const workflow = await readFile(".github/workflows/pages.yml", "utf8");
  assert.equal(workflow.includes("workflow_dispatch:"), true);
  assert.equal(workflow.includes("push:"), true);
  assert.equal(workflow.includes("pages: write"), true);
  assert.equal(workflow.includes("id-token: write"), true);
  assert.equal(workflow.includes("actions/upload-pages-artifact"), true);
  assert.equal(workflow.includes("actions/deploy-pages"), true);
  assert.equal(workflow.includes("actions/configure-pages"), false);
  assert.equal(workflow.includes("enablement: true"), false);
});

test("README 面向小白提供两个清晰安装入口", async () => {
  const readme = await readFile("README.md", "utf8");

  assert.equal(readme.includes("[一键安装到 Shadowrocket](" + mainInstallUrl + ")"), true);
  assert.equal(readme.includes("[打开安装网页](" + webInstallUrl + ")"), true);
  assert.equal(readme.includes("复制到 Safari 地址栏打开"), false);
  assert.equal(readme.includes("把下面这一整行复制"), false);

  const mainInstallMatches = readme.match(new RegExp(escapeRegExp(mainInstallUrl), "g")) ?? [];
  const webInstallMatches = readme.match(new RegExp(escapeRegExp(webInstallUrl), "g")) ?? [];
  assert.equal(mainInstallMatches.length, 1, "README 不应重复出现主安装入口");
  assert.equal(webInstallMatches.length, 1, "README 不应重复出现安装网页入口");
});

test("网站首页提供直接安装到 Shadowrocket 的按钮", async () => {
  const index = await readFile("docs/index.html", "utf8");
  assert.equal(index.includes("id=\"install-main\""), true);
  assert.equal(index.includes("一键安装到 Shadowrocket"), true);
  assert.equal(index.includes("onclick=\"return openShadowrocket(this.href)\""), true);
  assert.equal(index.includes("if (url) openShadowrocket(shadowrocketInstallUrl(url));"), true);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
