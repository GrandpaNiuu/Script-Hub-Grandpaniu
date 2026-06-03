# Script-Hub-Grandpaniu

Script Hub Grandpaniu 是一个中文化的 Script Hub 增强模块原型。

它的目标很直接：识别其他工具的模块、插件或 manifest，并自动转换成
Shadowrocket（小火箭）可导入的安装入口。

本项目已在 Script Hub 上游 issue 中取得继续开发许可：

https://github.com/Script-Hub-Org/Script-Hub/issues/56

## 当前能力

- 识别 Surge / Shadowrocket `.sgmodule`
- 识别 Loon `.plugin`
- 识别 Stash `.stoverride`
- 识别 Quantumult X `.conf` / rewrite 内容
- 识别 Codex plugin manifest、Skill、MCP 配置和通用 JSON manifest
- 生成 `shadowrocket://install?module=<模块URL>`
- 提供可安装的 Shadowrocket 模块文件
- 提供 Node.js CLI 和库 API，方便继续接入 Script Hub 或其他前端

## 在线安装页面

启用 GitHub Pages 后，访问：

```text
https://grandpaniu.github.io/Script-Hub-Grandpaniu/
```

页面里可以：

- 粘贴任意公开模块 URL，一键跳转到 Shadowrocket 安装。
- 搜索已经收集的公开模块。
- 点击“一键安装”自动唤起 Shadowrocket。

如果 Pages 尚未启用，请在仓库 Settings → Pages 中选择 GitHub Actions 部署。

## 安装增强模块

Shadowrocket 中可使用这个模块地址：

```text
https://raw.githubusercontent.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/modules/script-hub-grandpaniu.sgmodule
```

也可以使用小火箭安装入口：

```text
shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule
```

模块安装后，也可在 Shadowrocket 环境中访问：

```text
https://grandpaniu.script-hub.local/install?url=<需要转换的模块URL>
```

例如：

```text
https://grandpaniu.script-hub.local/install?url=https%3A%2F%2Fexample.com%2Fdemo.sgmodule
```

页面会识别来源类型，并给出“导入到 Shadowrocket”的安装按钮。

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

## 库 API

```js
import {
  recognizeExternalModule,
  toShadowrocketInstallPayload
} from "script-hub-rocket-adapter";

const module = recognizeExternalModule({
  sourceUrl: "https://example.com/demo.plugin"
});

const payload = toShadowrocketInstallPayload(module, {
  sourceUrl: "https://example.com/demo.plugin"
});

console.log(payload.installUrl);
```

## 项目文件

- `modules/script-hub-grandpaniu.sgmodule`：Shadowrocket 增强模块
- `scripts/script-hub-grandpaniu-enhance.js`：模块运行时脚本
- `docs/index.html`：可公开访问的一键安装网站
- `docs/redirect.html`：HTTPS 到 `shadowrocket://` 的跳转桥
- `docs/data/modules.json`：公开模块 URL 列表
- `src/recognizer.js`：外部模块/插件识别器
- `src/converter.js`：Shadowrocket 安装入口转换器
- `docs/usage.md`：中文使用说明
- `docs/architecture.md`：架构说明
- `docs/authorization.md`：上游授权记录

## 授权和边界

本项目是独立兼容性工具，不代表 Script Hub 官方立场。

当前公开授权表示允许继续开发本项目。它不应被表述为官方背书、商标授权、排他
许可，或复制 Script Hub 私有/非公开资产的许可，除非上游维护者另行明确授权。
