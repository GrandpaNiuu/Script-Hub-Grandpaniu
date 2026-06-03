#!/usr/bin/env node
import path from "node:path";
import { discoverModules } from "./detectors.js";
import { formatPayload, toShadowrocketInstallPayload } from "./converter.js";
import { recognizeExternalModule } from "./recognizer.js";

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === "enhance") {
    return runEnhance(argv.slice(1));
  }

  const args = parseArgs(argv);
  const detected = await discoverModules(args.targetPath, {
    recursive: args.recursive
  });
  const payloads = detected.map((module) =>
    toShadowrocketInstallPayload(module, {
      sourceUrl: sourceUrlForModule(args, module),
      installBase: args.installBase,
      extraParams: args.extraParams
    })
  );

  if (args.format === "json") {
    const output = args.recursive ? payloads : payloads[0];
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${payloads.map((payload) => formatPayload(payload, args.format)).join("\n")}\n`);
}

function sourceUrlForModule(args, module) {
  if (!args.recursive) {
    return args.sourceUrl;
  }

  const relativePath = path
    .relative(args.targetPath, module.sourcePath)
    .replace(/\\/g, "/");

  if (args.sourceUrl.includes("{path}")) {
    return args.sourceUrl.replaceAll("{path}", encodeURI(relativePath));
  }

  return joinUrl(args.sourceUrl, relativePath);
}

function joinUrl(baseUrl, relativePath) {
  try {
    return new URL(relativePath, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
  } catch {
    return `${baseUrl.replace(/\/$/, "")}/${relativePath}`;
  }
}

async function runEnhance(argv) {
  const args = parseEnhanceArgs(argv);
  const detected = recognizeExternalModule({
    sourceUrl: args.sourceUrl,
    content: args.content
  });
  const payload = toShadowrocketInstallPayload(detected, {
    sourceUrl: args.sourceUrl,
    installBase: args.installBase,
    extraParams: args.extraParams
  });

  process.stdout.write(`${formatPayload(payload, args.format)}\n`);
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(helpText());
    process.exit(0);
  }

  const targetPath = argv[0];
  if (!targetPath) {
    throw new Error(helpText());
  }

  const sourceUrl = valueAfter(argv, "--source-url");
  if (!sourceUrl) {
    throw new Error("缺少 --source-url 参数");
  }

  return {
    targetPath,
    sourceUrl,
    installBase: valueAfter(argv, "--install-base"),
    recursive: argv.includes("--recursive"),
    format: valueAfter(argv, "--format") ?? "json",
    extraParams: collectParams(argv)
  };
}

function parseEnhanceArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(enhanceHelpText());
    process.exit(0);
  }

  const sourceUrl = valueAfter(argv, "--url") ?? argv[0];
  if (!sourceUrl) {
    throw new Error(enhanceHelpText());
  }

  return {
    sourceUrl,
    content: valueAfter(argv, "--content") ?? "",
    installBase: valueAfter(argv, "--install-base"),
    format: valueAfter(argv, "--format") ?? "url",
    extraParams: collectParams(argv)
  };
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return argv[index + 1];
}

function collectParams(argv) {
  const params = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== "--param") {
      continue;
    }
    const pair = argv[index + 1];
    const separator = pair?.indexOf("=");
    if (!pair || separator === -1) {
      throw new Error("--param 必须使用 key=value 格式");
    }
    params[pair.slice(0, separator)] = pair.slice(separator + 1);
  }
  return params;
}

function helpText() {
  return `用法: script-hub-rocket-adapter <路径> --source-url <URL> [选项]
       script-hub-rocket-adapter enhance <module-url> [options]

选项:
  --install-base <url>  安装 URL 基础地址，默认 shadowrocket://install
  --format <format>     输出格式：json、url、params，默认 json
  --recursive           递归发现目录下支持的 manifest
  --param <key=value>   添加额外安装参数，可重复传入
  -h, --help            显示帮助
`;
}

function enhanceHelpText() {
  return `用法: script-hub-rocket-adapter enhance <模块URL> [选项]

选项:
  --url <url>           模块/插件 URL，也可以直接作为位置参数传入
  --content <text>      可选模块内容，用于提升识别准确度
  --install-base <url>  安装 URL 基础地址，默认 shadowrocket://install
  --format <format>     输出格式：json、url、params，默认 url
  --param <key=value>   添加额外安装参数，可重复传入
  -h, --help            显示帮助
`;
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
