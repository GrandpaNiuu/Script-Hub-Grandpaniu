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
  const installUrl = buildInstallUrl(DEFAULT_INSTALL_BASE, { module: sourceUrl });

  if (format === "json") {
    return respond(200, "application/json; charset=utf-8", JSON.stringify({
      module: moduleInfo,
      installUrl,
      parsed
    }, null, 2));
  }

  if (format === "url") {
    return respond(200, "text/plain; charset=utf-8", installUrl);
  }

  return respond(200, "text/html; charset=utf-8", renderHtml(moduleInfo, installUrl, parsed));
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

function recognizeExternalModule(input) {
  const sourceUrl = input.sourceUrl || "";
  const content = input.content || "";
  const loweredUrl = sourceUrl.toLowerCase();
  const loweredContent = content.toLowerCase();

  if (loweredUrl.includes(".codex-plugin/") || loweredUrl.endsWith("plugin.json")) {
    return moduleInfo("codex-plugin", nameFromUrl(sourceUrl, "codex-plugin"), sourceUrl);
  }
  if (loweredUrl.endsWith("skill.md") || /^---\s*\n[\s\S]*\bname:/i.test(content)) {
    return moduleInfo("skill", frontmatterName(content) || nameFromUrl(sourceUrl, "skill"), sourceUrl);
  }
  if (loweredUrl.endsWith(".sgmodule") || loweredUrl.endsWith(".module") || looksLikeSurgeModule(loweredContent)) {
    return moduleInfo("surge-shadowrocket-module", contentName(content) || nameFromUrl(sourceUrl, "surge-module"), sourceUrl);
  }
  if (loweredUrl.endsWith(".plugin") || looksLikeLoonPlugin(loweredContent)) {
    return moduleInfo("loon-plugin", contentName(content) || nameFromUrl(sourceUrl, "loon-plugin"), sourceUrl);
  }
  if (loweredUrl.endsWith(".stoverride") || looksLikeStashOverride(loweredContent)) {
    return moduleInfo("stash-override", nameFromUrl(sourceUrl, "stash-override"), sourceUrl);
  }
  if (loweredUrl.endsWith(".conf") || looksLikeQuantumultX(loweredContent)) {
    return moduleInfo("quantumult-x-config", contentName(content) || nameFromUrl(sourceUrl, "quantumult-x-config"), sourceUrl);
  }

  return moduleInfo("unknown-module", nameFromUrl(sourceUrl, "external-module"), sourceUrl);
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
  return decodeURIComponent(name)
    .replace(/\.(json|md|sgmodule|module|plugin|stoverride|conf)$/i, "")
    .replace(/[._-]+/g, " ")
    .trim() || "external-module";
}

function looksLikeSurgeModule(content) {
  return content.includes("#!name=") || content.includes("[script]") || content.includes("[mitm]");
}
function looksLikeLoonPlugin(content) {
  return content.includes("[plugin]") || content.includes("hostname =");
}
function looksLikeStashOverride(content) {
  return content.includes("payload:") && content.includes("behavior:");
}
function looksLikeQuantumultX(content) {
  return content.includes("[rewrite_local]") || content.includes("[task_local]") || content.includes("[mitm]");
}

function renderHtml(moduleInfo, installUrl, parsed) {
  const summary = Object.entries(parsed.summary).map(([name, count]) => `<li>${escapeHtml(name)}: ${count}</li>`).join("");
  return `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Script Hub Grandpaniu</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;padding:24px;background:#111827;color:#e5e7eb}
main{max-width:760px;margin:0 auto}
a{display:inline-block;margin-top:12px;padding:10px 14px;border-radius:8px;background:#22c55e;color:#052e16;text-decoration:none;font-weight:700}
code{word-break:break-all;color:#93c5fd}
</style>
<main>
<h1>Script Hub Grandpaniu</h1>
<p>识别结果：${escapeHtml(moduleInfo.name)} (${escapeHtml(moduleInfo.kind)})</p>
<p>来源：<code>${escapeHtml(moduleInfo.sourceUrl)}</code></p>
<ul>${summary}</ul>
<a href="${escapeHtml(installUrl)}">导入到 Shadowrocket</a>
</main>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function respond(status, contentType, body) {
  if (typeof $done === "function") {
    return $done({ response: { status, headers: { "Content-Type": contentType }, body } });
  }
  return { status, contentType, body };
}

main();
