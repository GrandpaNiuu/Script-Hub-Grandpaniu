#!/usr/bin/env node
import { discoverModules } from "./detectors.js";
import { formatPayload, toRocketInstallPayload } from "./converter.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const detected = await discoverModules(args.targetPath, {
    recursive: args.recursive
  });
  const payloads = detected.map((module) =>
    toRocketInstallPayload(module, {
      sourceUrl: args.sourceUrl,
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
    throw new Error("--source-url is required");
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
      throw new Error("--param must be provided as key=value");
    }
    params[pair.slice(0, separator)] = pair.slice(separator + 1);
  }
  return params;
}

function helpText() {
  return `Usage: script-hub-rocket-adapter <path> --source-url <url> [options]

Options:
  --install-base <url>  Install URL base. Defaults to rocket://install
  --format <format>     Output format: json, url, or params. Defaults to json
  --recursive           Discover supported manifests below a directory
  --param <key=value>   Add an extra install parameter. Can be repeated
  -h, --help            Show this help
`;
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
