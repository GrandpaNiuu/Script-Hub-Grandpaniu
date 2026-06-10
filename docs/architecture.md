# 架构说明

项目分成四层。

## 识别层

`src/recognizer.js` 负责识别外部模块或插件 URL。

当前支持：

- Surge / Shadowrocket 模块
- Loon 插件
- Stash override
- Quantumult X 配置或 rewrite 内容
- Codex plugin、Skill、MCP config、通用 JSON manifest

`src/detectors.js` 负责识别本地文件或目录，适合仓库扫描、测试和批量转换。

## 转换层

`src/converter.js` 把识别后的模块转换成 Shadowrocket 安装入口：

```text
shadowrocket://install?module=<模块URL>
```

转换层只使用公开 URL，不复制 Script Hub 私有逻辑或第三方资源。

## CLI 层

`src/cli.js` 提供两个入口：

- `enhance <url>`：识别外部模块 URL 并输出小火箭安装入口
- `<path> --source-url <url>`：扫描本地 manifest 并转换

## Shadowrocket 模块层

`modules/script-hub-grandpaniu.sgmodule` 会加载：

```text
scripts/script-hub-grandpaniu-enhance.js
```

该脚本拦截：

```text
https://grandpaniu.script-hub.local/install
```

并根据 `url` 参数生成安装页面、JSON 或纯 URL。
