# Script-Hub-Grandpaniu

面向 Shadowrocket 的 Script Hub 增强工具。当前主模块为 **Script Hub Grandpaniu V2**，提供本地健康检查、链接分析、内容分析、Script-Hub 转换入口，以及指定网页中的模块链接识别能力。

> 本项目不是 Script Hub 官方项目，只引用 Script-Hub 官方公开脚本地址，不内嵌、不复制、不再分发 Script-Hub 官方源码。

## 立即安装

### 方式一：打开自动安装页

[打开安装网页](https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/grandpa-niu.html)

打开页面后会自动尝试拉起 Shadowrocket。注意：iOS 和 Shadowrocket 的确认导入弹窗无法被网页跳过，需要你手动确认一次。

### 方式二：直接导入 V2 主模块

```text
shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu-v2.sgmodule
```

## 工具网站入口

[打开完整工具网站](https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/index.html)

工具网站包含：

- 模块库
- 单链接转换
- 批量识别
- 内容分析
- 主模块安装
- 使用说明

页面顶部如果显示 `页面版本：V2-main-only-20260604`，说明你看到的是新版页面。

## 安装后怎么确认生效

1. 打开 Shadowrocket。
2. 进入模块列表。
3. 确认 `Script Hub Grandpaniu V2` 已经启用。
4. 开启 MITM / HTTPS 解密，并确认 iPhone 已信任证书。
5. 用 Safari 打开：

```text
http://grandpaniu.script.hub
```

正常会看到健康检查页面。

## 它能做什么

- 识别 Quantumult X 重写链接。
- 识别 Surge 模块链接。
- 识别 Loon 插件链接。
- 识别常见 `.sgmodule`、`.module`、`.plugin`、`.lpx`、`.conf`、`.list` 链接。
- 调用 Script-Hub 官方转换脚本。
- 生成 Shadowrocket 可安装的模块入口。
- 在指定网页中发现模块链接时，显示 Grandpaniu 模块助手。

## 推荐使用方式

### 1. 粘贴链接转换

打开工具网站，在“单链接转换”里粘贴模块 URL，点击“分析/转换”。

### 2. 批量识别

把网页内容、README、聊天记录粘贴到“批量识别”，页面会自动提取可转换模块链接。

### 3. 本地增强入口

```text
http://grandpaniu.script.hub/install?url=模块链接&convertType=类型
```

常见类型：

```text
surge-module
qx-rewrite
loon-plugin
rule-set
all-module
```

## 常见问题

### 工具网站里还显示旧内容怎么办？

RawGithack 和 Safari 都可能缓存旧页面。可以尝试：

1. 下拉刷新页面。
2. 关闭 Safari 标签页后重新打开。
3. 在 URL 后面加参数强制刷新，例如：

```text
https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/index.html?v=20260604
```

如果页面顶部没有看到 `页面版本：V2-main-only-20260604`，说明你仍在看旧缓存。

### 安装后没有效果怎么办？

请检查：

1. 模块是否启用。
2. 是否安装的是 `Script Hub Grandpaniu V2`。
3. Shadowrocket 是否已经开启 MITM。
4. 证书是否已经安装并信任。
5. 当前访问的链接是否属于支持的类型。

### 模块库为什么不是“全网所有模块”？

全网公开模块数量大、来源复杂，很多模块带 MITM、重写、脚本注入。全部收录不安全，也不利于小白判断。当前只收录来源明确、维护者清楚、适合 Shadowrocket 或 Script Hub 转换的公开模块源。

## 支持的模块段落

模块转换会尽量识别并保留：

- `General`
- `Header Rewrite`
- `URL Rewrite`
- `Body Rewrite`
- `Script`
- `MITM`

## Script-Hub 官方脚本引用

增强模块引用 Script-Hub 官方脚本地址，不内嵌官方源码：

- `script-hub.js`
- `Rewrite-Parser.js`
- `rule-parser.js`
- `script-converter.js`

## 授权说明

本项目已获得 Script Hub 上游维护者允许继续开发：

https://github.com/Script-Hub-Org/Script-Hub/issues/56

本项目不是 Script Hub 官方项目，也不复制、内置或再分发 Script Hub 源码、私有 API、付费内容或不可公开分发的第三方资源。

## 开发者信息

运行测试：

```bash
npm test
```

把外部模块 URL 转成 Shadowrocket 安装入口：

```bash
node src/cli.js enhance https://example.com/demo.sgmodule
```
