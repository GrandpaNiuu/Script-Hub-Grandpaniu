import { promises as fs } from "node:fs";
import path from "node:path";

const SKIP_DIRECTORIES = new Set([".git", "node_modules", "dist", "coverage"]);

export async function detectModule(targetPath) {
  const stat = await fs.stat(targetPath);
  if (stat.isDirectory()) {
    return detectFromDirectory(targetPath);
  }

  if (path.basename(targetPath).toLowerCase() === "skill.md") {
    return detectSkill(targetPath);
  }

  return detectJsonManifest(targetPath);
}

export async function discoverModules(targetPath, options = {}) {
  const stat = await fs.stat(targetPath);
  if (!stat.isDirectory() || !options.recursive) {
    return [await detectModule(targetPath)];
  }

  const modules = [];
  const seenSources = new Set();
  for await (const candidate of walkManifestCandidates(targetPath)) {
    try {
      const detected = await detectModule(candidate);
      if (!seenSources.has(detected.sourcePath)) {
        modules.push(detected);
        seenSources.add(detected.sourcePath);
      }
    } catch {
      // Discovery skips unsupported JSON files and keeps scanning.
    }
  }

  if (modules.length === 0) {
    throw new Error(`No supported plugin/module manifests found in ${targetPath}`);
  }

  return modules;
}

async function detectFromDirectory(dir) {
  const codexPluginPath = path.join(dir, ".codex-plugin", "plugin.json");
  if (await exists(codexPluginPath)) {
    return detectCodexPlugin(codexPluginPath);
  }

  const skillPath = path.join(dir, "SKILL.md");
  if (await exists(skillPath)) {
    return detectSkill(skillPath);
  }

  const packagePath = path.join(dir, "package.json");
  if (await exists(packagePath)) {
    return detectJsonManifest(packagePath);
  }

  throw new Error(`No supported plugin/module manifest found in ${dir}`);
}

async function* walkManifestCandidates(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const names = new Set(entries.map((entry) => entry.name));

  if (names.has(".codex-plugin")) {
    const pluginManifest = path.join(dir, ".codex-plugin", "plugin.json");
    if (await exists(pluginManifest)) {
      yield dir;
    }
  }

  if (names.has("SKILL.md")) {
    yield path.join(dir, "SKILL.md");
  }

  if (names.has("package.json")) {
    yield path.join(dir, "package.json");
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || SKIP_DIRECTORIES.has(entry.name)) {
      continue;
    }
    yield* walkManifestCandidates(path.join(dir, entry.name));
  }
}

async function detectCodexPlugin(filePath) {
  const json = await readJson(filePath);
  const name = stringField(json, "name") ?? stringField(json, "id");
  if (!name) {
    throw new Error(`Codex plugin manifest is missing name/id: ${filePath}`);
  }

  return {
    kind: "codex-plugin",
    name,
    version: stringField(json, "version"),
    description: stringField(json, "description"),
    entry: stringField(json, "entry"),
    sourcePath: filePath,
    metadata: json
  };
}

async function detectSkill(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  const frontmatter = parseFrontmatter(content);
  const name = frontmatter.name ?? path.basename(path.dirname(filePath));

  return {
    kind: "skill",
    name,
    description: frontmatter.description,
    sourcePath: filePath,
    metadata: frontmatter
  };
}

async function detectJsonManifest(filePath) {
  const json = await readJson(filePath);
  const servers = json.mcpServers;
  if (servers && typeof servers === "object") {
    const firstName = Object.keys(servers)[0];
    if (!firstName) {
      throw new Error(`MCP config has no servers: ${filePath}`);
    }

    return {
      kind: "mcp-server",
      name: firstName,
      sourcePath: filePath,
      metadata: json
    };
  }

  const name = stringField(json, "name") ?? stringField(json, "id");
  if (!name) {
    throw new Error(`Generic manifest is missing name/id: ${filePath}`);
  }

  return {
    kind: "generic-plugin",
    name,
    version: stringField(json, "version"),
    description: stringField(json, "description"),
    entry: stringField(json, "main") ?? stringField(json, "module"),
    sourcePath: filePath,
    metadata: json
  };
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Expected JSON object in ${filePath}`);
  }
  return parsed;
}

function stringField(source, key) {
  const value = source[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function parseFrontmatter(content) {
  if (!content.startsWith("---")) {
    return {};
  }

  const end = content.indexOf("\n---", 3);
  if (end === -1) {
    return {};
  }

  const block = content.slice(3, end).trim();
  const result = {};
  for (const line of block.split(/\r?\n/)) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (match) {
      result[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
  return result;
}
