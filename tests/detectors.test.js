import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { detectModule } from "../src/detectors.js";

test("detects Codex plugin manifests", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "rocket-adapter-"));
  const manifestDir = path.join(dir, ".codex-plugin");
  await mkdir(manifestDir);
  await writeFile(
    path.join(manifestDir, "plugin.json"),
    JSON.stringify({ name: "demo-plugin", version: "0.1.0" })
  );

  const detected = await detectModule(dir);

  assert.equal(detected.kind, "codex-plugin");
  assert.equal(detected.name, "demo-plugin");
  assert.equal(detected.version, "0.1.0");
});

test("detects skills from frontmatter", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "rocket-adapter-"));
  await writeFile(
    path.join(dir, "SKILL.md"),
    "---\nname: demo-skill\ndescription: Demo skill\n---\n"
  );

  const detected = await detectModule(dir);

  assert.equal(detected.kind, "skill");
  assert.equal(detected.name, "demo-skill");
  assert.equal(detected.description, "Demo skill");
});
