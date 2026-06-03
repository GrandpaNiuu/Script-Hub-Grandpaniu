# Script-Hub-Grandpaniu

中文化的 Script Hub 增强模块项目，用来把其他工具的模块、插件或 manifest 转成 Shadowrocket（小火箭）可导入的安装入口。

已获得 Script Hub 上游维护者允许继续开发：  
https://github.com/Script-Hub-Org/Script-Hub/issues/56

## 一键导入

[![导入增强模块](https://img.shields.io/badge/Grandpa%20Niu-一键导入%20Shadowrocket-22c55e?style=for-the-badge)](https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/grandpa-niu.html)

可立即访问的网站入口：

```text
https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/index.html
```

Grandpa Niu 专属导入页：

```text
https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/grandpa-niu.html
```

模块原始地址：

```text
https://raw.githubusercontent.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/modules/script-hub-grandpaniu.sgmodule
```

Shadowrocket 安装入口：

```text
shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule
```

## 网站

网站文件在 `docs/`，当前 README 的按钮使用 RawGithack 作为立即可用入口，避免 GitHub Pages 未启用时出现 404。

如果要使用 GitHub Pages 正式域名，请在 GitHub Pages 中选择 `Deploy from a branch`，分支选 `main`，目录选 `/docs`。

启用后访问：

```text
https://grandpaniuu.github.io/Script-Hub-Grandpaniu/
```

网站提供：

- 模块库：展示当前可导入的公开模块。
- URL 导入：粘贴任意 `.sgmodule`、`.module`、`.plugin`、`.conf` 链接，一键跳转到 Shadowrocket。
- 内容分析：粘贴模块内容，分析 `General`、`Header Rewrite`、`URL Rewrite`、`Body Rewrite`、`Script`、`MITM` 等段落。
- 转换输出：生成 Shadowrocket 模块文本，方便复制或保存。
- Grandpa Niu 专属链接：`docs/grandpa-niu.html`。

说明：仓库不再使用 GitHub Actions 部署 Pages，因为当前仓库权限会导致 `Resource not accessible`。保留失败 workflow 只会反复红叉。

## 当前支持的模块结构

转换器会识别和保留这些关键段：

- `General`
- `Header Rewrite`
- `URL Rewrite`
- `Body Rewrite`
- `Script`
- `MITM`
- `Rule`
- `Host`
- `Map Local`

## Script-Hub 官方脚本接入

增强模块引用 Script-Hub 官方脚本地址，不内嵌官方源码：

- `script-hub.js`
- `Rewrite-Parser.js`
- `rule-parser.js`
- `script-converter.js`

模块还加入了 Kelee / PluginHub 页面中的常见导入链接改写：

- Quantumult X rewrite 链接 -> Shadowrocket 模块
- Surge `.sgmodule` / `.module` 链接 -> Shadowrocket 模块
- Loon `.plugin` / `.lpx` 链接 -> Shadowrocket 模块

同时加入：

```text
force-http-engine-hosts = %APPEND% script.hub, *.script.hub
```

## CLI

把外部模块 URL 转成小火箭安装入口：

```bash
node src/cli.js enhance https://example.com/demo.sgmodule
```

递归扫描本地示例并输出安装 URL：

```bash
node src/cli.js examples --recursive \
  --source-url https://example.com/modules/ \
  --format url
```

运行测试：

```bash
npm test
```

## 项目结构

- `docs/index.html`：模块导入与转换网站
- `docs/redirect.html`：HTTPS 到 `shadowrocket://` 的跳转桥
- `docs/grandpa-niu.html`：Grandpa Niu 专属导入页
- `docs/data/modules.json`：公开模块 URL 列表
- `modules/script-hub-grandpaniu.sgmodule`：Shadowrocket 增强模块
- `scripts/script-hub-grandpaniu-enhance.js`：增强模块运行脚本
- `src/module-parser.js`：模块段落解析与转换
- `src/recognizer.js`：外部模块/插件识别
- `src/converter.js`：Shadowrocket 安装入口生成
- `tests/`：自动化测试

## 维护规则

- 只收录公开 URL，不复制第三方模块内容。
- 第三方模块可用性、安全性和合法性请自行判断。
- 不声称本项目是 Script Hub 官方项目。
- 授权和边界记录见 `docs/authorization.md`。
