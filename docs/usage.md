# 使用说明

## 1. 启用一键安装网站

本仓库的网站文件在 `docs/` 目录。

README 的主按钮直接使用 Shadowrocket 安装入口：

```text
shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule
```

网站由 GitHub Actions 发布到 GitHub Pages。

正式入口：

```text
https://grandpaniuu.github.io/Script-Hub-Grandpaniu/
```

Grandpa Niu 专属导入页：

```text
https://grandpaniuu.github.io/Script-Hub-Grandpaniu/grandpa-niu.html
```

如果 Pages 仍显示 404，请到仓库 `Settings -> Pages` 确认 Source 已选择 `GitHub Actions`，然后重新运行 `Deploy Pages`。

## 2. 安装 Shadowrocket 增强模块

模块地址：

```text
https://raw.githubusercontent.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/modules/script-hub-grandpaniu.sgmodule
```

小火箭安装入口：

```text
shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule
```

## 3. 使用增强入口

安装模块后，在 Shadowrocket 环境中访问：

```text
https://grandpaniu.script-hub.local/install?url=<模块或插件URL>
```

返回 JSON：

```text
https://grandpaniu.script-hub.local/install?url=https%3A%2F%2Fexample.com%2Fdemo.plugin&format=json
```

只返回小火箭安装 URL：

```text
https://grandpaniu.script-hub.local/install?url=https%3A%2F%2Fexample.com%2Fdemo.plugin&format=url
```

## 4. CLI

转换一个外部模块 URL：

```bash
node src/cli.js enhance https://example.com/demo.sgmodule
```

带内容辅助识别：

```bash
node src/cli.js enhance https://example.com/raw \
  --content "#!name=Demo Module\n[Script]\n"
```

扫描本地目录：

```bash
node src/cli.js examples \
  --source-url https://example.com/modules/ \
  --recursive \
  --format url
```

输出格式：

- `json`：完整 payload
- `url`：只输出 `shadowrocket://install?...`
- `params`：只输出 URL query 参数
