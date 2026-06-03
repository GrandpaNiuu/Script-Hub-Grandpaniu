# Script-Hub-Grandpaniu

这是一个给 Shadowrocket 使用的 Script Hub 增强模块，可以把 Quantumult X、Surge、Loon 等工具的模块/插件链接转换成 Shadowrocket 可安装的模块入口。

## 立即安装

### 方法一：一键安装到 Shadowrocket（推荐）

[一键安装到 Shadowrocket](shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule)

优先点这个。如果手机已经安装 Shadowrocket，会直接弹出模块安装提示。

### 方法二：打开自动安装页

[打开安装网页](https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/grandpa-niu.html)

打开页面后会自动尝试拉起 Shadowrocket。注意：iOS 和 Shadowrocket 的确认导入弹窗无法被网页跳过，需要你手动确认一次。

## 工具网站入口

[打开完整工具网站](https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/index.html)

这个页面包含精选模块库、URL 检测转换、内容分析与转换。模块库已经内置精选兜底列表，即使外部 JSON 加载失败，也不会变成空白页。

> GitHub Pages 地址只有在仓库 Pages 已启用并成功部署后才能访问。未启用前请优先使用上面的 RawGithack 工具网站入口。

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

点 `Open the page` 继续打开页面。页面会自动尝试拉起 Shadowrocket；如果没有反应，再点页面里的“再次打开 Shadowrocket”。

### GitHub Pages 地址显示 404 怎么办？

说明仓库还没有启用 GitHub Pages，或者 Pages 没有部署成功。这不影响 RawGithack 工具网站入口和 Shadowrocket 安装入口。

### 工具网站里模块库空白怎么办？

刷新页面。新版页面已经内置精选模块库兜底数据，即使 `docs/data/modules.json` 加载失败，也会显示基础模块列表。

### 模块库为什么不是“全网所有模块”？

全网公开模块数量大、来源复杂，很多模块带 MITM、重写、脚本注入。全部收录不安全，也不利于小白判断。当前只收录来源明确、维护者清楚、适合 Shadowrocket 或 Script Hub 转换的公开模块源。

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
