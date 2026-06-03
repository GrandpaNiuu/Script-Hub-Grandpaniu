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

test("仓库文档没有乱码、冲突标记或截断链接", async () => {
  for (const file of textFiles) {
    const content = await readFile(file, "utf8");
    assert.equal(content.includes(conflictMarker), false, `${file} 存在冲突标记`);
    assert.equal(content.includes("\uFFFD"), false, `${file} 存在替换字符`);
    assert.equal(/[\u93C4\uE21C\u6F61\u9366\u6D93]/.test(content), false, `${file} 疑似中文乱码`);
    assert.equal(/script-hub-grandpaniu\.\s*$/m.test(content), false, `${file} 存在截断模块链接`);
  }
});

test("仓库包含 GitHub Pages Actions 部署 workflow", async () => {
  const workflow = await readFile(".github/workflows/pages.yml", "utf8");
  assert.equal(workflow.includes("workflow_dispatch:"), true);
  assert.equal(workflow.includes("push:"), false);
  assert.equal(workflow.includes("pages: write"), true);
  assert.equal(workflow.includes("id-token: write"), true);
  assert.equal(workflow.includes("actions/deploy-pages"), true);
});

test("README 使用直接安装入口、备用镜像和正确的 GitHub Pages 地址", async () => {
  const readme = await readFile("README.md", "utf8");
  assert.equal(readme.includes("shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule"), true);
  assert.equal(readme.includes("https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/index.html"), true);
  assert.equal(readme.includes("https://grandpaniuu.github.io/Script-Hub-Grandpaniu/"), true);
  assert.equal(readme.includes("https://grandpaniu.github.io/Script-Hub-Grandpaniu/"), false);
});

test("网站首页提供直接安装到 Shadowrocket 的按钮", async () => {
  const index = await readFile("docs/index.html", "utf8");
  assert.equal(index.includes("id=\"install-main\""), true);
  assert.equal(index.includes("一键安装到 Shadowrocket"), true);
  assert.equal(index.includes("document.getElementById(\"install-main\").href = shadowrocketInstallUrl(selfModuleUrl);"), true);
  assert.equal(index.includes("if (url) location.href = shadowrocketInstallUrl(url);"), true);
});
