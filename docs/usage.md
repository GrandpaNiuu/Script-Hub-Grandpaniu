# 使用说明

## 在线安装页面

推荐优先使用网页：

```text
https://grandpaniuu.github.io/Script-Hub-Grandpaniu/
```

网页会从 `docs/data/modules.json` 读取模块列表，并通过 `docs/redirect.html` 跳转到：

```text
shadowrocket://install?module=<模块URL>
```

这样比直接在 README 里点击 `shadowrocket://` 更稳定。

## 安装 Shadowrocket 增强模块

模块地址：

```text
https://raw.githubusercontent.com/GrandpaNiuu/Script-Hub-Grandpaniu/main/modules/script-hub-grandpaniu.sgmodule
```

小火箭安装入口：

```text
shadowrocket://install?module=https%3A%2F%2Fraw.githubusercontent.com%2FGrandpaNiuu%2FScript-Hub-Grandpaniu%2Fmain%2Fmodules%2Fscript-hub-grandpaniu.sgmodule
```

## 使用增强入口

模块安装后访问：

```text
https://grandpaniu.script-hub.local/install?url=<模块或插件URL>
```

返回 HTML 页面：

```text
https://grandpaniu.script-hub.local/install?url=https%3A%2F%2Fexample.com%2Fdemo.plugin
```

返回 JSON：

```text
https://grandpaniu.script-hub.local/install?url=https%3A%2F%2Fexample.com%2Fdemo.plugin&format=json
```

只返回小火箭安装 URL：

```text
https://grandpaniu.script-hub.local/install?url=https%3A%2F%2Fexample.com%2Fdemo.plugin&format=url
```

## CLI

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

也可以使用 `{path}` 模板控制远程路径：

```bash
node src/cli.js examples \
  --source-url "https://example.com/raw/{path}" \
  --recursive \
  --format url
```

输出格式：

- `json`：完整 payload
- `url`：只输出 `shadowrocket://install?...`
- `params`：只输出 URL query 参数
