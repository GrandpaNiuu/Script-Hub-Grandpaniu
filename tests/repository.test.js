import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

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

test("仓库不再包含会失败的 Pages Actions 部署 workflow", async () => {
  try {
    await access(".github/workflows/pages.yml");
    assert.fail("pages.yml 不应存在，当前仓库权限会导致 Pages Actions 部署失败");
  } catch (error) {
    assert.equal(error.code, "ENOENT");
  }
});

test("README 使用正确的 GitHub Pages 地址", async () => {
  const readme = await readFile("README.md", "utf8");
  assert.equal(readme.includes("https://grandpaniuu.github.io/Script-Hub-Grandpaniu/"), true);
  assert.equal(readme.includes("https://grandpaniu.github.io/Script-Hub-Grandpaniu/"), false);
});
