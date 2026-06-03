# 使用说明

## 1. 启用一键安装网站

本仓库的网站文件在 `docs/` 目录。

README 的主按钮使用下面这个立即可访问的入口，不依赖 GitHub Pages 是否已经启用：

```text
https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/index.html
```

Grandpa Niu 专属导入页：

```text
https://raw.githack.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/docs/grandpa-niu.html
```

如果希望使用 `grandpaniuu.github.io` 正式域名，请在 GitHub 仓库中手动启用 Pages：

1. 打开 `Settings -> Pages`。
2. `Build and deployment` 选择 `Deploy from a branch`。
3. Branch 选择 `main`。
4. Folder 选择 `/docs`。
5. 保存。

启用后访问：

```text
https://grandpaniuu.github.io/Script-Hub-Grandpaniu/
```

Grandpa Niu 专属导入页：

```text
https://grandpaniuu.github.io/Script-Hub-Grandpaniu/grandpa-niu.html
```

不再使用 GitHub Actions 部署 Pages。原因是当前仓库 Actions 无法创建 Pages 站点，会出现 `Resource not accessible`，保留该 workflow 只会反复失败。

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
