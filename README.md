# Script-Hub-Grandpaniu

给 Shadowrocket 用的 Script Hub 增强模块。

它可以帮助你把 Loon、Surge、Quantumult X 等工具里的模块/插件链接，转换成 Shadowrocket 可以安装的模块入口。

## 只看这里

### 主安装入口

把下面这一整行复制到 Safari 地址栏打开：

```text
shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule
```

打开后，Shadowrocket 会弹出安装提示，确认安装即可。

### 安装模块网页入口

不会复制链接的话，打开这个网页：

```text
https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/grandpa-niu.html
```

第一次打开会看到 RawGithack 的确认页。点 `Open the page`，进入页面后点：

```text
一键导入 Shadowrocket
```

### 工具网站入口

这个页面用于查看模块库、粘贴 URL、转换模块：

```text
https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/index.html
```

## GitHub Pages 入口

正式网站地址：

```text
https://grandpaniuu.github.io/Script-Hub-Grandpaniu/
```

如果这里显示 404，说明仓库 Pages 还没有启用。进入仓库：

```text
Settings -> Pages -> Source 选择 GitHub Actions
```

然后到 `Actions` 手动运行 `Deploy Pages`。如果你只是想安装模块，不需要管这个 404，直接用上面的两个安装入口即可。

## 支持内容

模块转换会识别并保留这些段落：

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

本项目是独立增强工具，不是 Script Hub 官方项目，也不复制、内置或再分发 Script Hub 源码、私有 API、付费内容或不可公开分发的第三方资源。

## 开发者命令

运行测试：

```bash
npm test
```

把外部模块 URL 转成 Shadowrocket 安装入口：

```bash
node src/cli.js enhance https://example.com/demo.sgmodule
```
