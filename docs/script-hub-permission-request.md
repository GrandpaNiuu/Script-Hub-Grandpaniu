# Permission Request Draft for Script Hub

Target upstream repository: `Script-Hub-Org/Script-Hub`

Suggested issue title:

```text
Permission request: independent adapter for Script Hub-compatible install payloads
```

Suggested issue body:

```markdown
Hello Script Hub maintainers,

I am GrandpaNiuu, maintainer of:

https://github.com/GrandpaNiuu/Script-Hub-Grandpaniu

I am building an independent compatibility adapter prototype. Its goal is to
detect public metadata from other tools' modules/plugins, such as plugin
manifests or module descriptors, and convert that metadata into a configurable
rocket-install payload for user-provided install workflows.

I would like to ask for your permission or guidance before describing this as a
Script Hub built-in module or official Script Hub enhancement.

Current boundaries:

- The project does not copy, embed, modify, or redistribute Script Hub source
  code.
- The project does not use private Script Hub APIs, paid scripts, bundled script
  resources, or non-public assets.
- The project is currently described as an independent compatibility adapter,
  not an official Script Hub project.
- If formal authorization is required, I will keep an authorization record in
  `docs/authorization.md`.
- If you require specific wording, attribution, branding limits, naming changes,
  or removal of Script Hub references, I am willing to adjust the repository.

Requested permission:

1. May this project reference "Script Hub" in its README and documentation as a
   compatibility target?
2. May this project emit Script Hub-style install payloads from user-provided
   metadata?
3. If this project later becomes a built-in Script Hub module, what authorization
   wording, attribution, or implementation boundaries do you require?

Thank you for maintaining Script Hub. I want to keep this integration respectful
and compliant with your expectations.
```

## 中文说明稿

```markdown
Script Hub 维护者您好：

我是 GrandpaNiuu，目前维护这个项目：

https://github.com/GrandpaNiuu/Script-Hub-Grandpaniu

我正在做一个独立的兼容性适配器原型，用来识别其他工具的模块、插件或
manifest 元数据，并将这些用户提供或公开可见的元数据转换为可配置的小火箭
安装 payload。

在把它描述为 Script Hub 内置模块或官方增强模块之前，我希望先征求你们的
授权或指导。

当前项目边界：

- 不复制、内置、修改或再分发 Script Hub 源码。
- 不使用 Script Hub 私有 API、付费脚本、内置脚本资源或非公开资产。
- 当前只描述为独立兼容性适配器，不声称是 Script Hub 官方项目。
- 如果需要正式授权，我会在 `docs/authorization.md` 中记录授权信息。
- 如果你们要求特定署名、品牌使用限制、命名调整或删除 Script Hub 相关引用，
  我愿意按要求修改仓库。

想申请确认：

1. 是否允许该项目在 README 和文档中以兼容目标的方式提到 “Script Hub”？
2. 是否允许该项目基于用户提供的元数据生成 Script Hub-style install payload？
3. 如果未来想做成 Script Hub 内置模块，需要怎样的授权文字、署名方式和实现边界？

感谢你们维护 Script Hub。我希望这个集成保持尊重、清晰并符合你们的要求。
```
