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
const toolSiteUrl = "https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/index.html";
const pagesUrl = "https://grandpaniuu.github.io/Script-Hub-Grandpaniu/";

test("仓库文档没有乱码、冲突标记或截断链接", async () => {
  for (const file of textFiles) {
    const content = await readFile(file, "utf8");
    assert.equal(content.includes(conflictMarker), false, `${file} 存在冲突标记`);
    assert.equal(content.includes("\uFFFD"), false, `${file} 存在替换字符`);
    assert.equal(/[\u93C4\uE21C\u6F61\u9366\u6D93]/.test(content), false, `${file} 疑似中文乱码`);
    assert.equal(/script-hub-grandpaniu\.\s*$/m.test(content), false, `${file} 存在截断模块链接`);
  }
});

test("站点 workflow 默认只手动检查，不自动部署 Pages", async () => {
  const workflow = await readFile(".github/workflows/pages.yml", "utf8");
  assert.equal(workflow.includes("name: Site Tools Check"), true);
  assert.equal(workflow.includes("workflow_dispatch:"), true);
  assert.equal(workflow.includes("deploy_pages:"), true);
  assert.equal(workflow.includes("default: false"), true);
  assert.equal(workflow.includes("push:"), false);
  assert.equal(workflow.includes("actions/upload-artifact"), true);
  assert.equal(workflow.includes("actions/upload-pages-artifact"), true);
  assert.equal(workflow.includes("actions/deploy-pages"), true);
  assert.equal(workflow.includes("if: github.event_name == 'workflow_dispatch' && inputs.deploy_pages == true"), true);
  assert.equal(workflow.includes("actions/configure-pages"), false);
  assert.equal(workflow.includes("enablement: true"), false);
});

test("README 面向小白提供安装入口和工具网站入口", async () => {
  const readme = await readFile("README.md", "utf8");

  assert.equal(readme.includes("[一键安装到 Shadowrocket](" + mainInstallUrl + ")"), true);
  assert.equal(readme.includes("[打开安装网页](" + webInstallUrl + ")"), true);
  assert.equal(readme.includes("[打开完整工具网站](" + toolSiteUrl + ")"), true);
  assert.equal(readme.includes(pagesUrl), true);
  assert.equal(readme.includes("复制到 Safari 地址栏打开"), false);
  assert.equal(readme.includes("把下面这一整行复制"), false);

  const mainInstallMatches = readme.match(new RegExp(escapeRegExp(mainInstallUrl), "g")) ?? [];
  const webInstallMatches = readme.match(new RegExp(escapeRegExp(webInstallUrl), "g")) ?? [];
  const toolSiteMatches = readme.match(new RegExp(escapeRegExp(toolSiteUrl), "g")) ?? [];
  assert.equal(mainInstallMatches.length, 1, "README 不应重复出现主安装入口");
  assert.equal(webInstallMatches.length, 1, "README 不应重复出现安装网页入口");
  assert.equal(toolSiteMatches.length, 1, "README 不应重复出现工具网站入口");
});

test("网站首页提供完整工具能力", async () => {
  const index = await readFile("docs/index.html", "utf8");
  assert.equal(index.includes("id=\"install-main\""), true);
  assert.equal(index.includes("一键安装到 Shadowrocket"), true);
  assert.equal(index.includes("快速安装"), true);
  assert.equal(index.includes("模块库"), true);
  assert.equal(index.includes("URL 检测转换"), true);
  assert.equal(index.includes("内容分析"), true);
  assert.equal(index.includes("FALLBACK_MODULES"), true);
  assert.equal(index.includes("外部模块库加载失败，已使用内置兜底列表"), true);
  assert.equal(index.includes("detectUrlType"), true);
  assert.equal(index.includes("scriptHubConvertUrl"), true);
  assert.equal(index.includes("复制转换入口"), true);
  assert.equal(index.includes("分类"), true);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
