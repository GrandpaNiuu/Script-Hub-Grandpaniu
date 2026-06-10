# Script Hub Grandpaniu

这是给 Shadowrocket 用的 Script Hub 增强模块。你可以把 Surge 模块、Loon 插件、Quantumult X Rewrite、规则集链接转换成 Shadowrocket 可以安装的入口。

本项目不是 Script Hub 官方项目，只引用 Script-Hub 官方公开脚本地址，不内嵌、不复制、不再分发 Script-Hub 官方源码。

## 新手先看这里

### 第一步：安装主模块

[打开主模块安装页](https://grandpaniuu.github.io/Script-Hub-Grandpaniu/docs/grandpa-niu.html)

如果网页没有自动拉起 Shadowrocket，就复制下面这一行到 Safari 打开：

```text
shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu-v2.sgmodule
```

### 第二步：启用模块

打开 Shadowrocket，进入模块列表，启用 `Script Hub Grandpaniu V2`。需要网页识别和脚本转换时，请同时开启 MITM / HTTPS 解密，并信任证书。

### 第三步：打开工具网站

[打开 Grandpaniu 工具站](https://grandpaniuu.github.io/Script-Hub-Grandpaniu/docs/index.html)

工具站里可以直接选择模块，也可以粘贴自己的模块链接进行转换。

## 我该点哪个按钮

- `安装主模块`：第一次使用必须点，用来把 Grandpaniu V2 装进 Shadowrocket。
- `转换后导入`：推荐点这个，适合 Surge、Loon、QX 等外部模块。
- `原链接导入`：只适合本来就是 Shadowrocket 可直接导入的模块。
- `打开分析页`：先看风险、段落和转换类型，再决定是否导入。

## 工具网站和主模块有什么区别

- 主模块装在 Shadowrocket 里，负责接管 `script.hub` 和 `grandpaniu.script.hub`，也负责识别支持网页中的模块链接。
- 工具网站运行在浏览器里，负责给新手提供入口、模块库、批量扫描和复制链接。
- 没安装主模块时，工具网站仍然能生成 Shadowrocket 安装链接；安装主模块后，分析页和网页识别才会完整生效。

## 支持识别什么

- Surge / Shadowrocket：`.sgmodule`、`.module`
- Loon：`.plugin`、`.lpx`
- Quantumult X：Rewrite `.conf`
- 规则集：`.list`
- 常见网页跳转链接：`?url=`、`?target=`、`?redirect=`、`remote-resource=`
- 常见 App Scheme：`surge://`、`loon://`、`quantumult-x://`、`shadowrocket://`
- 模块段落：`General`、`Header Rewrite`、`URL Rewrite`、`Body Rewrite`、`Script`、`MITM`

## 安装后怎么检测

在 Safari 打开：

```text
http://grandpaniu.script.hub/health
```

能看到健康检查页面，说明主模块已经响应。打不开时优先检查：模块是否启用、MITM 是否开启、证书是否信任、Shadowrocket 是否正在运行。

## Pages 404 怎么修

如果工具站打开是 404，请到仓库 `Settings -> Pages` 设置：

- Source：`Deploy from a branch`
- Branch：`gh-pages`
- Folder：`/ (root)`

本仓库工作流会把静态网站发布到 `gh-pages` 分支，不再依赖容易报鉴权错误的 Pages deployment API。

## 授权和声明

Script Hub 上游维护者已允许继续开发：

https://github.com/Script-Hub-Org/Script-Hub/issues/56

本项目不复制、不内置、不再分发 Script Hub 源码、私有 API、付费内容或不可公开分发的第三方资源。模块库只整理公开 URL，导入任何第三方模块前都建议先查看原始内容。

## 开发

```bash
npm test
```
