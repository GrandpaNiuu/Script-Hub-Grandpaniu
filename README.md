# Script-Hub-Grandpaniu

中文化的 Script Hub 增强模块项目。

项目目标：识别其他工具的模块、插件或 manifest，并转换成 Shadowrocket（小火箭）可导入的安装入口。

上游授权记录：  
https://github.com/Script-Hub-Org/Script-Hub/issues/56

## 一键安装网站

仓库提供静态网站文件，位置在 `docs/`。

启用方式：

1. 进入仓库 `Settings -> Pages`。
2. `Build and deployment` 选择 `Deploy from a branch`。
3. Branch 选择 `main`，目录选择 `/docs`。
4. 保存后访问：

```text
https://grandpaniuu.github.io/Script-Hub-Grandpaniu/
```

说明：本仓库不再使用 GitHub Actions 部署 Pages，因为当前仓库权限会导致 `Resource not accessible`，继续保留会反复红叉。

网站功能：

- 粘贴公开模块 URL，一键跳转到 Shadowrocket 安装。
- 搜索已收集的公开模块。
- 使用 HTTPS 跳转页桥接到 `shadowrocket://install?...`。

## 安装增强模块

模块地址：

```text
https://raw.githubusercontent.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/modules/script-hub-grandpaniu.sgmodule

## 当前能力

- 识别 Surge / Shadowrocket `.sgmodule`
- 识别 Loon `.plugin`
- 识别 Stash `.stoverride`
- 识别 Quantumult X `.conf` / rewrite 内容
- 识别 Codex plugin manifest、Skill、MCP 配置和通用 JSON manifest
- 生成 `shadowrocket://install?module=<模块URL>`
- 提供可安装的 Shadowrocket 模块文件
- 提供 Node.js CLI 和库 API

## CLI 使用

把任意外部模块 URL 转成小火箭安装入口：

```bash
node src/cli.js enhance https://example.com/demo.sgmodule
```

输出：

```text
shadowrocket://install?module=https%3A%2F%2Fexample.com%2Fdemo.sgmodule
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

- `docs/index.html`：一键安装网站
- `docs/redirect.html`：HTTPS 到 `shadowrocket://` 的跳转页
- `docs/data/modules.json`：公开模块 URL 列表
- `modules/script-hub-grandpaniu.sgmodule`：Shadowrocket 增强模块
- `scripts/script-hub-grandpaniu-enhance.js`：模块运行时脚本
- `src/recognizer.js`：外部模块/插件识别器
- `src/converter.js`：Shadowrocket 安装入口转换器
- `tests/`：自动化测试

## 模块列表

模块列表只收录公开 URL，不复制第三方模块内容。第三方模块的可用性、安全性和合法性请自行判断。

维护模块列表：

```text
docs/data/modules.json
```

## 授权和边界

本项目是独立兼容性工具，不代表 Script Hub 官方立场。

当前公开授权表示允许继续开发本项目。它不应被表述为官方背书、商标授权、排他许可，或复制 Script Hub 私有/非公开资产的许可，除非上游维护者另行明确授权。
