# Script-Hub-Grandpaniu

这是一个给 Shadowrocket 使用的 Script Hub 增强模块，可以把 Quantumult X、Surge、Loon 等工具的模块/插件链接转换成 Shadowrocket 可安装的模块入口。

## 立即安装

### 方法一：一键安装到 Shadowrocket（推荐）

[一键安装到 Shadowrocket](shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule)

优先点这个。如果手机已经安装 Shadowrocket，会直接弹出模块安装提示。

### 方法二：打开安装网页

[打开安装网页](https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/grandpa-niu.html)

如果上面的“一键安装”没有反应，就点这个网页入口。第一次打开可能会看到 RawGithack 的确认页，点 `Open the page` 继续，进入页面后再点“一键导入 Shadowrocket”。

## 安装后怎么用

1. 打开 Shadowrocket。
2. 进入模块列表。
3. 确认 `Script Hub Grandpaniu` 已经启用。
4. 打开插件中心或支持的模块链接。
5. 遇到 Quantumult X、Surge、Loon 的模块/插件链接时，它会尝试转换成 Shadowrocket 可安装入口。

## 它能做什么

- 识别 Quantumult X 重写链接。
- 识别 Surge 模块链接。
- 识别 Loon 插件链接。
- 调用 Script-Hub 官方转换脚本。
- 生成 Shadowrocket 可安装的模块入口。

## 常见问题

### 点“一键安装到 Shadowrocket”没反应怎么办？

先确认手机已经安装 Shadowrocket。如果还是没反应，请使用上面的“打开安装网页”入口。

### 打开网页后看到 RawGithack 提示怎么办？

点 `Open the page` 继续打开页面，然后点页面里的“一键导入 Shadowrocket”。

### 安装后没有效果怎么办？

请检查：

1. 模块是否启用。
2. Shadowrocket 是否已经开启 MitM。
3. 证书是否已经安装并信任。
4. 当前访问的链接是否属于支持的类型。

### 这个项目是不是 Script Hub 官方项目？

不是。本项目是独立增强工具，只引用 Script-Hub 官方公开脚本地址，不内嵌、不复制、不再分发 Script-Hub 官方源码。

## 支持的内容

模块转换会尽量识别并保留：

- `General`
- `Header Rewrite`
- `URL Rewrite`
- `Body Rewrite`
- `Script`
- `MITM`

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
