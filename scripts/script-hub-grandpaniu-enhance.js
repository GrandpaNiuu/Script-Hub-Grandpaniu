const DEFAULT_INSTALL_BASE = "shadowrocket://install";
const CORE_SECTIONS = ["General", "Header Rewrite", "URL Rewrite", "Body Rewrite", "Script", "MITM"];

function main() {
  const requestUrl = typeof $request !== "undefined" ? $request.url : "";
  const params = parseQuery(requestUrl);
  const sourceUrl = params.url || params.module || "";
  const content = params.content || "";
  const format = params.format || "html";

  if (!sourceUrl) {
    return respond(400, "text/plain; charset=utf-8", "Missing url parameter. Example: ?url=https://example.com/demo.sgmodule");
  }

  const moduleInfo = recognizeExternalModule({ sourceUrl, content });
  const parsed = parseModuleContent(content);
  const risk = assessRisk(moduleInfo, parsed, content);
  const installUrl = buildInstallUrl(DEFAULT_INSTALL_BASE, { module: sourceUrl });
  const convertUrl = buildScriptHubConvertUrl(sourceUrl, moduleInfo.kind);

  if (format === "json") {
    return respond(200, "application/json; charset=utf-8", JSON.stringify({ module: moduleInfo, risk, installUrl, convertUrl, parsed }, null, 2));
  }

  if (format === "url") {
    return respond(200, "text/plain; charset=utf-8", installUrl);
  }

  return respond(200, "text/html; charset=utf-8", renderHtml(moduleInfo, risk, installUrl, convertUrl, parsed));
}

function parseQuery(requestUrl) {
  try {
    const url = new URL(requestUrl);
    return Object.fromEntries(url.searchParams.entries());
  } catch {
    return {};
  }
}

function buildInstallUrl(base, params) {
  return `${base}?${new URLSearchParams(params).toString()}`;
}

function buildScriptHubConvertUrl(sourceUrl, kind) {
  const map = {
    "quantumult-x-config": ["qx-rewrite", "auto-qx.sgmodule"],
    "loon-plugin": ["loon-plugin", "auto-loon.sgmodule"],
    "surge-shadowrocket-module": ["surge-module", "auto-surge.sgmodule"],
    "stash-override": ["all-module", "auto-stash.sgmodule"],
    "unknown-module": ["all-module", "auto-module.sgmodule"]
  };
  const [type, filename] = map[kind] || ["all-module", "auto-module.sgmodule"];
  const scriptHubUrl = `http://script.hub/file/_start_/${sourceUrl}/_end_/${filename}?type=${type}&target=shadowrocket-module&del=true&jqEnabled=true`;
  return buildInstallUrl(DEFAULT_INSTALL_BASE, { module: scriptHubUrl });
}

function recognizeExternalModule(input) {
  const sourceUrl = input.sourceUrl || "";
  const content = input.content || "";
  const loweredUrl = sourceUrl.toLowerCase();
  const loweredContent = content.toLowerCase();

  if (loweredUrl.includes(".codex-plugin/") || loweredUrl.endsWith("plugin.json")) return moduleInfo("codex-plugin", nameFromUrl(sourceUrl, "codex-plugin"), sourceUrl);
  if (loweredUrl.endsWith("skill.md") || /^---\s*\n[\s\S]*\bname:/i.test(content)) return moduleInfo("skill", frontmatterName(content) || nameFromUrl(sourceUrl, "skill"), sourceUrl);
  if (loweredUrl.endsWith(".sgmodule") || loweredUrl.endsWith(".module") || looksLikeSurgeModule(loweredContent)) return moduleInfo("surge-shadowrocket-module", contentName(content) || nameFromUrl(sourceUrl, "surge-module"), sourceUrl);
  if (loweredUrl.endsWith(".plugin") || loweredUrl.endsWith(".lpx") || looksLikeLoonPlugin(loweredContent)) return moduleInfo("loon-plugin", contentName(content) || nameFromUrl(sourceUrl, "loon-plugin"), sourceUrl);
  if (loweredUrl.endsWith(".stoverride") || looksLikeStashOverride(loweredContent)) return moduleInfo("stash-override", nameFromUrl(sourceUrl, "stash-override"), sourceUrl);
  if (loweredUrl.endsWith(".conf") || looksLikeQuantumultX(loweredContent)) return moduleInfo("quantumult-x-config", contentName(content) || nameFromUrl(sourceUrl, "quantumult-x-config"), sourceUrl);

  return moduleInfo("unknown-module", nameFromUrl(sourceUrl, "external-module"), sourceUrl);
}

function assessRisk(moduleInfo, parsed, content) {
  const lower = String(content || "").toLowerCase();
  const summary = parsed.summary || {};
  const requiresMitm = (summary.MITM || 0) > 0 || lower.includes("hostname =") || lower.includes("[mitm]");
  const containsScript = (summary.Script || 0) > 0 || lower.includes("script-path") || lower.includes("script-") || lower.includes("[script]");
  const hasBodyRewrite = (summary["Body Rewrite"] || 0) > 0 || lower.includes("body rewrite");
  const hasRewrite = (summary["URL Rewrite"] || 0) > 0 || lower.includes("http-response") || lower.includes("http-request") || lower.includes("url rewrite");

  let level = "low";
  const reasons = [];

  if (requiresMitm) reasons.push("需要 MITM 或 hostname 权限");
  if (containsScript) reasons.push("包含脚本执行能力");
  if (hasBodyRewrite) reasons.push("包含 Body Rewrite，可能改写响应内容");
  if (hasRewrite) reasons.push("包含请求/响应重写规则");
  if (["codex-plugin", "skill"].includes(moduleInfo.kind)) reasons.push("不是标准代理模块，导入前需确认用途");

  if (hasBodyRewrite || (requiresMitm && containsScript)) level = "high";
  else if (requiresMitm || containsScript || hasRewrite) level = "medium";

  return { level, label: riskLabel(level), requiresMitm, containsScript, hasBodyRewrite, hasRewrite, reasons };
}

function riskLabel(level) {
  return level === "high" ? "高风险" : level === "medium" ? "中风险" : "低风险";
}

function parseModuleContent(content) {
  const sections = {};
  let currentSection;
  for (const rawLine of String(content || "").replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed || /^#!/.test(trimmed)) continue;
    const section = /^\[([^\]]+)\]$/.exec(trimmed);
    if (section) {
      currentSection = normalizeSection(section[1]);
      sections[currentSection] ||= [];
      continue;
    }
    if (currentSection) sections[currentSection].push(line);
  }
  const summary = {};
  for (const name of CORE_SECTIONS) summary[name] = sections[name]?.length || 0;
  for (const [name, rows] of Object.entries(sections)) summary[name] ??= rows.length;
  return { sections, summary };
}

function normalizeSection(name) {
  const key = name.trim().toLowerCase();
  const aliases = {
    "general": "General",
    "header rewrite": "Header Rewrite",
    "header-rewrite": "Header Rewrite",
    "rewrite": "URL Rewrite",
    "url rewrite": "URL Rewrite",
    "url-rewrite": "URL Rewrite",
    "body rewrite": "Body Rewrite",
    "body-rewrite": "Body Rewrite",
    "script": "Script",
    "mitm": "MITM",
    "rule": "Rule",
    "host": "Host",
    "map local": "Map Local"
  };
  return aliases[key] || name.trim();
}

function moduleInfo(kind, name, sourceUrl) {
  return { kind, name, sourceUrl };
}

function contentName(content) {
  const match = /^#!\s*name\s*=\s*(.+)$/im.exec(content);
  return match?.[1]?.trim();
}

function frontmatterName(content) {
  const match = /^---\s*\n[\s\S]*?^name:\s*(.+)$/im.exec(content);
  return match?.[1]?.trim().replace(/^["']|["']$/g, "");
}

function nameFromUrl(sourceUrl, fallback) {
  try {
    const url = new URL(sourceUrl);
    return cleanName(url.pathname.split("/").filter(Boolean).pop() || fallback);
  } catch {
    return cleanName(sourceUrl.split(/[\\/]/).filter(Boolean).pop() || fallback);
  }
}

function cleanName(name) {
  return decodeURIComponent(name).replace(/\.(json|md|sgmodule|module|plugin|lpx|stoverride|conf)$/i, "").replace(/[._-]+/g, " ").trim() || "external-module";
}

function looksLikeSurgeModule(content) { return content.includes("#!name=") || content.includes("[script]") || content.includes("[mitm]"); }
function looksLikeLoonPlugin(content) { return content.includes("[plugin]") || content.includes("hostname ="); }
function looksLikeStashOverride(content) { return content.includes("payload:") && content.includes("behavior:"); }
function looksLikeQuantumultX(content) { return content.includes("[rewrite_local]") || content.includes("[task_local]") || content.includes("[mitm]"); }

function renderHtml(moduleInfo, risk, installUrl, convertUrl, parsed) {
  const summary = Object.entries(parsed.summary).map(([name, count]) => `<li>${escapeHtml(name)}: ${count}</li>`).join("");
  const reasons = risk.reasons.length ? risk.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("") : "<li>未发现明显高风险特征，但仍建议检查原始内容。</li>";
  return `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Script Hub Grandpaniu</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;padding:24px;background:#111827;color:#e5e7eb}
main{max-width:820px;margin:0 auto}.card{border:1px solid #243044;border-radius:12px;background:#0f172a;padding:16px;margin:12px 0}
a{display:inline-block;margin:8px 8px 8px 0;padding:10px 14px;border-radius:8px;background:#22c55e;color:#052e16;text-decoration:none;font-weight:800}.secondary{background:#1f2937;color:#dbeafe;border:1px solid #243044}
code{word-break:break-all;color:#93c5fd}.risk-low{color:#86efac}.risk-medium{color:#fde68a}.risk-high{color:#fecdd3}
</style>
<main>
<h1>Script Hub Grandpaniu</h1>
<div class="card">
<h2>识别结果</h2>
<p>名称：${escapeHtml(moduleInfo.name)}</p>
<p>类型：${escapeHtml(moduleInfo.kind)}</p>
<p>来源：<code>${escapeHtml(moduleInfo.sourceUrl)}</code></p>
</div>
<div class="card">
<h2>风险判断：<span class="risk-${escapeHtml(risk.level)}">${escapeHtml(risk.label)}</span></h2>
<ul>${reasons}</ul>
<p>MITM：${risk.requiresMitm ? "需要或疑似需要" : "未发现"}；脚本：${risk.containsScript ? "包含或疑似包含" : "未发现"}；Body Rewrite：${risk.hasBodyRewrite ? "包含" : "未发现"}</p>
</div>
<div class="card">
<h2>模块段落统计</h2>
<ul>${summary}</ul>
</div>
<div class="card">
<h2>导入方式</h2>
<a href="${escapeHtml(installUrl)}">直接导入 Shadowrocket</a>
<a class="secondary" href="${escapeHtml(convertUrl)}">通过 Script Hub 转换后导入</a>
<p>建议：如果是 QX、Loon、Surge 外部模块，优先使用“通过 Script Hub 转换后导入”。</p>
</div>
</main>
</html>`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function respond(status, contentType, body) {
  if (typeof $done === "function") {
    return $done({ response: { status, headers: { "Content-Type": contentType }, body } });
  }
  return { status, contentType, body };
}

main();
