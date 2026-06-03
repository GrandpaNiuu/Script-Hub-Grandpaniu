#!/usr/bin/env node
import { detectModule } from "./detectors.js";
import { toRocketInstallPayload } from "./converter.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const detected = await detectModule(args.targetPath);
  const payload = toRocketInstallPayload(detected, {
    sourceUrl: args.sourceUrl,
    installBase: args.installBase
  });

  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

function parseArgs(argv) {
  const targetPath = argv[0];
  if (!targetPath) {
    throw new Error("Usage: script-hub-rocket-adapter <path> --source-url <url>");
  }

  const sourceUrl = valueAfter(argv, "--source-url");
  if (!sourceUrl) {
    throw new Error("--source-url is required");
  }

  return {
    targetPath,
    sourceUrl,
    installBase: valueAfter(argv, "--install-base")
  };
}

function valueAfter(argv, flag) {
  const index = argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return argv[index + 1];
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
