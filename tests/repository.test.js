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
  "scripts/script-hub-grandpaniu-enhance.js"
];
const conflictMarker = "<" + "<<<<<<";
const mainInstallUrl = "shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule";
const webInstallUrl = "https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/grandpa-niu.html";
const toolSiteUrl = "https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/index.html";

test("仓库文档没有乱码、冲突标记或截断链接", async () => {
  for (const file of textFiles) {
    const content = await readFile(file, "utf8");
    assert.equal(content.includes(conflictMarker), false, `${file} 存在冲突标记`);
    assert.equal(content.includes("\uFFFD"), false, `${file} 存在替换字符`);
    assert.equal(/[\u93C4\uE21C\u6F61\u9366\u6D93]/.test(content), false, `${file} 疑似中文乱码`);
    assert.equal(/script-hub-grandpaniu\.\s*$/m.test(content), false, `${file} 存在截断模块链接`);
  }
});

test("Site workflow 负责站点部署并在 Pages 未配置时安全跳过", async () => {
  const workflow = await readFile(".github/workflows/site.yml", "utf8");
  assert.equal(workflow.includes("name: Site"), true);
  assert.equal(workflow.includes("workflow_dispatch:"), true);
  assert.equal(workflow.includes("push:"), true);
  assert.equal(workflow.includes("docs/**"), true);
  assert.equal(workflow.includes("pages: write"), true);
  assert.equal(workflow.includes("id-token: write"), true);
  assert.equal(workflow.includes("Check GitHub Pages settings"), true);
  assert.equal(workflow.includes("enabled=false"), true);
  assert.equal(workflow.includes("actions/upload-pages-artifact"), true);
  assert.equal(workflow.includes("actions/deploy-pages"), true);
  assert.equal(workflow.includes("actions/configure-pages"), false);
  assert.equal(workflow.includes("enablement: true"), false);
});

test("Check workflow 只手动运行并执行测试", async () => {
  const workflow = await readFile(".github/workflows/check.yml", "utf8");
  assert.equal(workflow.includes("name: Check"), true);
  assert.equal(workflow.includes("workflow_dispatch:"), true);
  assert.equal(workflow.includes("push:"), false);
  assert.equal(workflow.includes("npm test"), true);
  assert.equal(workflow.includes("actions/upload-artifact"), true);
});

test("根目录 index.html 会跳转到 docs 工具网站", async () => {
  const index = await readFile("index.html", "utf8");
  assert.equal(index.includes("docs/index.html"), true);
  assert.equal(index.includes("location.replace"), true);
});

test("README 面向小白提供安装入口和工具网站入口", async () => {
  const readme = await readFile("README.md", "utf8");

  assert.equal(readme.includes("[一键安装到 Shadowrocket](" + mainInstallUrl + ")"), true);
  assert.equal(readme.includes("[打开安装网页](" + webInstallUrl + ")"), true);
  assert.equal(readme.includes("[打开完整工具网站](" + toolSiteUrl + ")"), true);
  assert.equal(readme.includes("GitHub Pages 地址只有在仓库 Pages 已启用并成功部署后才能访问"), true);
  assert.equal(readme.includes("复制到 Safari 地址栏打开"), false);
  assert.equal(readme.includes("把下面这一整行复制"), false);

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
  assert.equal(catalog.notice.includes("精选公开模块源"), true);
  assert.equal(Boolean(catalog.riskLevels.low), true);
  assert.equal(Boolean(catalog.riskLevels.medium), true);
  assert.equal(Boolean(catalog.riskLevels.high), true);
  assert.equal(ids.includes("script-hub-shadowrocket"), true);
  assert.equal(ids.includes("sub-store"), true);
  assert.equal(ids.includes("blackmatrix7-allinone"), true);
  assert.equal(ids.includes("skk-mitm-hostnames"), false);
  for (const item of catalog.modules) {
    assert.equal(typeof item.riskLevel, "string", `${item.id} 缺少 riskLevel`);
    assert.equal(typeof item.riskNote, "string", `${item.id} 缺少 riskNote`);
    assert.equal(typeof item.requiresMitm, "boolean", `${item.id} 缺少 requiresMitm`);
    assert.equal(typeof item.containsScript, "boolean", `${item.id} 缺少 containsScript`);
  }
});

test("网站首页提供完整工具能力、精选模块兜底和风险展示", async () => {
  const index = await readFile("docs/index.html", "utf8");
  assert.equal(index.includes("id=\"install-main\""), true);
  assert.equal(index.includes("一键安装到 Shadowrocket"), true);
  assert.equal(index.includes("快速安装"), true);
  assert.equal(index.includes("精选模块库"), true);
  assert.equal(index.includes("URL 检测转换"), true);
  assert.equal(index.includes("内容分析"), true);
  assert.equal(index.includes("FALLBACK_MODULES"), true);
  assert.equal(index.includes("外部模块库加载失败，已使用内置精选兜底列表"), true);
  assert.equal(index.includes("script-hub-shadowrocket"), true);
  assert.equal(index.includes("sub-store"), true);
  assert.equal(index.includes("skk-mitm-hostnames"), false);
  assert.equal(index.includes("riskLevel"), true);
  assert.equal(index.includes("MITM："), true);
  assert.equal(index.includes("脚本："), true);
  assert.equal(index.includes("detectUrlType"), true);
  assert.equal(index.includes("scriptHubConvertUrl"), true);
  assert.equal(index.includes("复制转换入口"), true);
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
