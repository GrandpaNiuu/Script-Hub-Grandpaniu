# Script-Hub-Grandpaniu

这是一个给 Shadowrocket 使用的 Script Hub 增强模块，可以把 Quantumult X、Surge、Loon 等工具的模块/插件链接转换成 Shadowrocket 可安装的模块入口。

## 立即安装

## 工具网站入口

[打开完整工具网站](https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/index.html)

这个页面包含模块库、URL 导入、内容分析与转换。模块库已经内置兜底列表，就算外部 JSON 加载失败，也不会变成空白页。

如果 GitHub Pages 已经启用，也可以访问：

https://grandpaniuu.github.io/Script-Hub-Grandpaniu/


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

### 工具网站里模块库空白怎么办？

刷新页面。新版页面已经内置模块库兜底数据，即使 `docs/data/modules.json` 加载失败，也会显示基础模块列表。

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
