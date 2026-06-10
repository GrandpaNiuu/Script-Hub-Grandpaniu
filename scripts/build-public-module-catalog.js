import { writeFile } from "node:fs/promises";

const OWNER_REPO = "GrandpaNiuu/Script-Hub-Grandpaniu";
const OUTPUT = new URL("../docs/data/modules.json", import.meta.url);

const SOURCE_REPOSITORIES = [
  "GrandpaNiuu/Script-Hub-Grandpaniu",
  "Script-Hub-Org/Script-Hub",
  "blackmatrix7/ios_rule_script",
  "Maasea/sgmodule",
  "VirgilClyne/GetSomeFries",
  "sub-store-org/Sub-Store",
  "chavyleung/scripts",
  "app2smile/rules",
  "NobyDa/Script",
  "Peng-YM/QuanX",
  "KOP-XIAO/QuantumultX",
  "Tartarus2014/Loon-Script"
];

const CONVERT_TYPES = {
  "surge-module": "Surge / Shadowrocket 模块，通常是 .sgmodule 或 .module。",
  "qx-rewrite": "Quantumult X rewrite 配置，通常是 .conf。",
  "loon-plugin": "Loon 插件，通常是 .plugin 或 .lpx。",
  "rule-set": "规则集文件，通常是 .list 或 ruleset。",
  "all-module": "Stash / Egern / 通用模块，交给 Script Hub 通用转换链处理。"
};

const RISK_LEVELS = {
  low: "低风险：主要是规则集、入口或不需要 MITM 的模块。",
  medium: "中风险：包含脚本、重写或 MITM，需要按说明启用。",
  high: "高风险：包含大量脚本、广泛 MITM 或明显改变 App 行为。"
};

const token = process.env.GITHUB_TOKEN || "";
const headers = {
  "Accept": "application/vnd.github+json",
  "User-Agent": "Script-Hub-Grandpaniu-Catalog",
  ...(token ? { "Authorization": `Bearer ${token}` } : {})
};

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());

main().catch(error => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const modules = [];
  const seen = new Set();

  for (const repository of SOURCE_REPOSITORIES) {
    const repo = await githubJson(`https://api.github.com/repos/${repository}`);
    const branch = repo.default_branch || "main";
    const tree = await githubJson(`https://api.github.com/repos/${repository}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
    const files = (tree.tree || []).filter(item => item.type === "blob" && isSupportedPath(item.path));

    for (const file of files) {
      const convertType = inferConvertType(file.path);
      if (!convertType) continue;

      const url = rawUrl(repository, branch, file.path);
      if (seen.has(url)) continue;
      seen.add(url);

      const ownModule = repository === OWNER_REPO;
      modules.push({
        id: slug(`${repository}-${file.path}`),
        name: titleFromPath(file.path),
        category: categoryFromPath(repository, file.path, convertType),
        type: extension(file.path),
        convertType,
        verified: true,
        lastChecked: today,
        verificationNote: `来自公开仓库 ${repository} 的 ${branch}/${file.path}，通过 GitHub tree 索引确认路径存在。`,
        riskLevel: riskLevel(file.path, convertType),
        riskNote: riskNote(file.path, convertType),
        requiresMitm: mayRequireMitm(file.path, convertType),
        containsScript: mayContainScript(file.path, convertType),
        description: ownModule
          ? "Grandpaniu 仓库自有模块，推荐优先安装。"
          : "公开仓库模块链接；工具站只保存 raw URL，不复制源码，导入前建议先打开分析页查看风险。",
        url,
        source: repository,
        recommended: ownModule && file.path.includes("script-hub-grandpaniu-v2")
      });
    }
  }

  modules.sort((a, b) => {
    const own = Number(b.source === OWNER_REPO) - Number(a.source === OWNER_REPO);
    if (own) return own;
    const type = a.convertType.localeCompare(b.convertType);
    if (type) return type;
    return a.name.localeCompare(b.name, "zh-Hans-CN");
  });

  const payload = {
    updatedAt: today,
    notice: "公开仓库模块索引：收录多个公开仓库中路径仍存在、可通过 raw.githubusercontent.com 访问、并且扩展名可交给 Script Hub Grandpaniu V2 转换链处理的模块/插件/重写/规则集。工具站只保存公开 URL，不复制第三方源码；导入前请先查看分析页和原始仓库说明。",
    sourceRepositories: SOURCE_REPOSITORIES,
    convertTypes: CONVERT_TYPES,
    riskLevels: RISK_LEVELS,
    modules
  };

  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${modules.length} modules to ${OUTPUT.pathname}`);
}

async function githubJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return response.json();
}

function rawUrl(repository, branch, filePath) {
  return `https://raw.githubusercontent.com/${repository}/${branch}/${encodePath(filePath)}`;
}

function encodePath(filePath) {
  return filePath.split("/").map(part => encodeURIComponent(part)).join("/");
}

function extension(filePath) {
  return filePath.match(/\.([^.\/]+)$/)?.[1]?.toLowerCase() || "";
}

function inferConvertType(filePath) {
  const ext = extension(filePath);
  if (["sgmodule", "module"].includes(ext)) return "surge-module";
  if (["plugin", "lpx"].includes(ext)) return "loon-plugin";
  if (ext === "conf") return "qx-rewrite";
  if (["list", "ruleset"].includes(ext)) return "rule-set";
  if (["stoverride", "yaml", "yml"].includes(ext)) return "all-module";
  return "";
}

function isSupportedPath(filePath) {
  const ext = extension(filePath);
  if (["sgmodule", "module", "plugin", "lpx", "list", "ruleset"].includes(ext)) return true;
  if (ext === "conf") return /rewrite|plugin|module|quantumult|qx|loon|surge|script|cookie|task/i.test(filePath) && !/profile|example|readme/i.test(filePath);
  if (["stoverride", "yaml", "yml"].includes(ext)) return /stash|egern|override|module|plugin/i.test(filePath);
  return false;
}

function titleFromPath(filePath) {
  const raw = filePath.split("/").pop() || filePath;
  return decodeSafe(raw)
    .replace(/\.(sgmodule|module|plugin|lpx|conf|list|ruleset|stoverride|yaml|yml)$/i, "")
    .replace(/[-_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || raw;
}

function decodeSafe(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function categoryFromPath(repository, filePath, convertType) {
  if (repository === OWNER_REPO) return "Grandpaniu 官方模块";
  if (convertType === "surge-module") return "Surge / Shadowrocket";
  if (convertType === "qx-rewrite") return "Quantumult X";
  if (convertType === "loon-plugin") return "Loon";
  if (convertType === "rule-set") return "规则集";
  return "通用代理模块";
}

function riskLevel(filePath, convertType) {
  if (convertType === "rule-set") return "low";
  if (/mitm|rewrite|script|cookie|task|youtube|bilibili|tiktok|unlock|ads|advertising/i.test(filePath)) return "high";
  if (["surge-module", "qx-rewrite", "loon-plugin", "all-module"].includes(convertType)) return "medium";
  return "low";
}

function riskNote(filePath, convertType) {
  if (convertType === "rule-set") return "规则集通常只提供匹配规则，但仍建议查看原始仓库说明。";
  if (/mitm|script|cookie|task/i.test(filePath)) return "可能包含脚本、MITM、Cookie 或定时任务，导入前请先打开分析页检查。";
  return "公开模块链接，导入前建议先查看分析页确认作用范围。";
}

function mayRequireMitm(filePath, convertType) {
  if (convertType === "rule-set") return false;
  return /mitm|rewrite|script|plugin|sgmodule|conf|lpx|module/i.test(filePath);
}

function mayContainScript(filePath, convertType) {
  if (convertType === "rule-set") return false;
  return /script|cookie|task|plugin|sgmodule|module|lpx|conf/i.test(filePath);
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
