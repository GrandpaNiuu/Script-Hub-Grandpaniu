import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import os from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);

test("CLI can print only the install URL", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "rocket-adapter-"));
  const manifest = path.join(dir, "package.json");
  await writeFile(manifest, JSON.stringify({ name: "cli-demo" }));

  const { stdout } = await execFileAsync(process.execPath, [
    "src/cli.js",
    manifest,
    "--source-url",
    "https://example.test/package.json",
    "--format",
    "url"
  ]);

  assert.match(stdout.trim(), /^shadowrocket:\/\/install\?/);
  assert.match(stdout.trim(), /module=https%3A%2F%2Fexample.test%2Fpackage.json/);
});

test("CLI enhance converts external module URL to Shadowrocket install URL", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    "src/cli.js",
    "enhance",
    "https://example.test/demo.sgmodule"
  ]);

  assert.equal(
    stdout.trim(),
    "shadowrocket://install?module=https%3A%2F%2Fexample.test%2Fdemo.sgmodule"
  );
});
