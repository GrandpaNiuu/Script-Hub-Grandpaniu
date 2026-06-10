import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const textFiles = [
  "README.md",
  "NOTICE.md",
  "index.html",
  "docs/usage.md",
  "docs/architecture.md",
  "docs/authorization.md",
  "docs/roadmap.md",
  "docs/statement.zh-CN.md",
  "docs/index.html",
  "docs/redirect.html",
  "docs/grandpa-niu.html",
  "docs/data/modules.json",
  "modules/script-hub-grandpaniu.sgmodule",
  "scripts/script-hub-grandpaniu-enhance.js",
  "scripts/web-link-enhance-20260604.js",
  ".github/workflows/jekyll-gh-pages.yml"
];

const conflictMarker = "<" + "<<<<<<";
const mainInstallUrl = "shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu-v2.sgmodule";
const webInstallUrl = "https://grandpaniuu.github.io/Script-Hub-Grandpaniu/docs/grandpa-niu.html";
const toolSiteUrl = "https://grandpaniuu.github.io/Script-Hub-Grandpaniu/docs/index.html";

test("仓库关键文本文件没有冲突标记或截断链接", async () => {
  for (const file of textFiles) {
    const content = await readFile(file, "utf8");
    assert.equal(content.includes(conflictMarker), false, `${file} 存在冲突标记`);
    assert.equal(content.includes("\uFFFD"), false, `${file} 存在替换字符`);
    assert.equal(/script-hub-grandpaniu\.\s*$/m.test(content), false, `${file} 存在截断模块链接`);
  }
});

test("Pages 工作流发布静态站点到 gh-pages 分支", async () => {
  const workflow = await readFile(".github/workflows/jekyll-gh-pages.yml", "utf8");
  assert.match(workflow, /name:\s*Publish static site branch/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /cp -R docs modules scripts _site/);
  assert.match(workflow, /touch _site\/\.nojekyll/);
  assert.match(workflow, /node-version:\s*"24"/);
  assert.match(workflow, /contents:\s*write/);
  assert.match(workflow, /git push --force origin gh-pages/);
  assert.equal(workflow.includes("actions/jekyll-build-pages"), false);
  assert.equal(workflow.includes("actions/deploy-pages"), false);
  assert.equal(workflow.includes("actions/upload-pages-artifact"), false);
});

test("根目录 index.html 会跳转到 docs 工具网站", async () => {
  const index = await readFile("index.html", "utf8");
  assert.match(index, /docs\/index\.html/);
  assert.match(index, /location\.replace|http-equiv="refresh"/);
});

test("README 面向小白提供安装入口和工具网站入口", async () => {
  const readme = await readFile("README.md", "utf8");
  assert.equal(readme.includes("[打开主模块安装页](" + webInstallUrl + ")"), true);
  assert.equal(readme.includes(mainInstallUrl), true);
  assert.equal(readme.includes("[打开 Grandpaniu 工具站](" + toolSiteUrl + ")"), true);
  assert.equal(readme.includes("网页跳转"), true);
  assert.equal(readme.includes("工具网站和主模块有什么区别"), true);

  const mainInstallMatches = readme.match(new RegExp(escapeRegExp(mainInstallUrl), "g")) ?? [];
  const webInstallMatches = readme.match(new RegExp(escapeRegExp(webInstallUrl), "g")) ?? [];
  const toolSiteMatches = readme.match(new RegExp(escapeRegExp(toolSiteUrl), "g")) ?? [];
  assert.equal(mainInstallMatches.length, 1, "README 不应重复出现主安装入口");
  assert.equal(webInstallMatches.length, 1, "README 不应重复出现安装网页入口");
  assert.equal(toolSiteMatches.length, 1, "README 不应重复出现工具网站入口");
});

test("模块库使用精选公开模块源并包含风险元数据", async () => {
  const catalog = JSON.parse(await readFile("docs/data/modules.json", "utf8"));
  const ids = catalog.modules.map(item => item.id);
  assert.equal(catalog.notice.includes("公开模块"), true);
  assert.equal(Boolean(catalog.riskLevels.low), true);
  assert.equal(Boolean(catalog.riskLevels.medium), true);
  assert.equal(Boolean(catalog.riskLevels.high), true);
  assert.equal(ids.includes("script-hub-shadowrocket"), true);
  assert.equal(ids.includes("sub-store-surge"), true);
  assert.equal(ids.includes("blackmatrix7-allinone-shadowrocket"), true);
  for (const item of catalog.modules) {
    assert.equal(typeof item.riskLevel, "string", `${item.id} 缺少 riskLevel`);
    assert.equal(typeof item.riskNote, "string", `${item.id} 缺少 riskNote`);
    assert.equal(typeof item.requiresMitm, "boolean", `${item.id} 缺少 requiresMitm`);
    assert.equal(typeof item.containsScript, "boolean", `${item.id} 缺少 containsScript`);
  }
});

test("网站首页提供完整工具能力、精选模块兜底和风险展示", async () => {
  const index = await readFile("docs/index.html", "utf8");
  assert.equal(index.includes(mainInstallUrl), true);
  assert.equal(index.includes("模块库"), true);
  assert.equal(index.includes("单链接转换"), true);
  assert.equal(index.includes("批量识别"), true);
  assert.equal(index.includes("内容分析"), true);
  assert.equal(index.includes("工具网站"), true);
  assert.equal(index.includes("loadCatalog"), true);
  assert.equal(index.includes("scanText"), true);
  assert.equal(index.includes("inferType"), true);
  assert.equal(index.includes("function convertUrl"), true);
  assert.equal(index.includes("转换后导入"), true);
  assert.equal(index.includes("extractScriptHubSource"), true);
  assert.equal(index.includes("REDIRECT_PARAM_KEYS"), true);
});

test("安装网页会自动尝试打开 Shadowrocket", async () => {
  const page = await readFile("docs/grandpa-niu.html", "utf8");
  assert.equal(page.includes("window.addEventListener(\"load\""), true);
  assert.equal(page.includes("setTimeout(openShadowrocket, 300)"), true);
  assert.equal(page.includes("确认导入弹窗无法被网页绕过"), true);
});

test("本地增强入口提供风险报告和 Script Hub 转换入口", async () => {
  const script = await readFile("scripts/script-hub-grandpaniu-enhance.js", "utf8");
  assert.equal(script.includes("assessRisk"), true);
  assert.equal(script.includes("buildScriptHubConvertUrl"), true);
  assert.equal(script.includes("风险判断"), true);
  assert.equal(script.includes("通过 Script Hub 转换后导入"), true);
  assert.equal(script.includes("requiresMitm"), true);
  assert.equal(script.includes("containsScript"), true);
});

test("网页增强脚本支持跳转页隐藏链接识别", async () => {
  const script = await readFile("scripts/web-link-enhance-20260604.js", "utf8");
  assert.equal(script.includes("REDIRECT_PARAM_KEYS"), true);
  assert.equal(script.includes("detectRedirectParams"), true);
  assert.equal(script.includes("decodeDeep"), true);
  assert.equal(script.includes("http-equiv"), true);
  assert.equal(script.includes("location\\.href"), true);
  assert.equal(script.includes("data-url"), true);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
