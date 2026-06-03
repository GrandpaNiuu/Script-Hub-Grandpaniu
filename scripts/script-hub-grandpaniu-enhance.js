const DEFAULT_INSTALL_BASE = "shadowrocket://install";
const CORE_SECTIONS = ["General", "Header Rewrite", "URL Rewrite", "Body Rewrite", "Script", "MITM"];
const ALLOWED_CONVERT_TYPES = new Set(["surge-module", "qx-rewrite", "loon-plugin", "rule-set", "all-module"]);

function main() {
  const requestUrl = typeof $request !== "undefined" ? $request.url : "";
  const method = typeof $request !== "undefined" ? String($request.method || "GET").toUpperCase() : "GET";
  const body = typeof $request !== "undefined" ? String($request.body || "") : "";
  const urlInfo = parseUrl(requestUrl);
  const params = urlInfo.params;
  const route = urlInfo.pathname.replace(/\/+$/, "") || "/install";
  const format = normalizeFormat(params.format || "html");

  if (route === "/health") {
    return output(format, 200, {
      ok: true,
      name: "Script Hub Grandpaniu Enhance",
      version: "2026-06-04.2",
      routes: ["/install", "/analyze", "/health"],
      formats: ["html", "json", "url", "convert-url"],
      convertTypes: [...ALLOWED_CONVERT_TYPES]
    }, renderHealthHtml());
  }

  const sourceUrl = normalizeUrl(params.url || params.module || params.remote || "");
  const content = params.content || body || "";
  const preferredConvertType = normalizeConvertType(params.convertType || params.type || "");
  const analysisMode = route === "/analyze";

  if (!sourceUrl && !content) {
    const payload = {
      ok: false,
      error: "missing_input",
      message: "缺少 url/module 参数或请求正文。/install 适合 ?url=xxx；/analyze 适合 POST body。",
      examples: {
        install: "https://grandpaniu.script-hub.local/install?url=https://example.com/demo.sgmodule&convertType=surge-module",
        analyze: "POST https://grandpaniu.script-hub.local/analyze?convertType=surge-module"
      }
    };
    return output(format, 400, payload, renderErrorHtml(payload));
  }

  const inferredUrl = sourceUrl || "inline-content";
  const moduleInfo = recognizeExternalModule({ sourceUrl: inferredUrl, content, preferredConvertType });
  const parsed = parseModuleContent(content);
  const risk = assessRisk(moduleInfo, parsed, content);
  const convertType = preferredConvertType || moduleInfo.convertType;
  const installUrl = sourceUrl ? buildInstallUrl(DEFAULT_INSTALL_BASE, { module: sourceUrl }) : "";
  const convertUrl = sourceUrl ? buildScriptHubConvertUrl(sourceUrl, convertType) : "";

  const payload = {
    ok: true,
    mode: analysisMode ? "analyze" : "install",
    method,
    module: moduleInfo,
    convertType,
    risk,
    installUrl,
    convertUrl,
    parsed,
    hasBody: Boolean(body),
    bodyLength: body.length,
    contentLength: content.length
  };

  if (format === "url") return respond(200, "text/plain; charset=utf-8", installUrl || convertUrl || "");
  if (format === "convert-url") return respond(200, "text/plain; charset=utf-8", convertUrl || installUrl || "");
  return output(format, 200, payload, renderHtml(payload));
}

function parseUrl(requestUrl) {
  try {
    const url = new URL(requestUrl || "https://grandpaniu.script-hub.local/install");
    return { pathname: url.pathname || "/install", params: Object.fromEntries(url.searchParams.entries()) };
  } catch {
    return { pathname: "/install", params: {} };
  }
}

function normalizeUrl(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

function normalizeFormat(format) {
  const value = String(format || "html").toLowerCase();
  return ["html", "json", "url", "convert-url"].includes(value) ? value : "html";
}

function normalizeConvertType(value) {
  const raw = String(value || "").trim().toLowerCase();
  const aliases = {
    "surge": "surge-module",
    "sgmodule": "surge-module",
    "module": "surge-module",
    "qx": "qx-rewrite",
    "quantumult-x": "qx-rewrite",
    "quantumultx": "qx-rewrite",
    "rewrite": "qx-rewrite",
    "loon": "loon-plugin",
    "plugin": "loon-plugin",
    "ruleset": "rule-set",
    "rule": "rule-set",
    "list": "rule-set",
    "all": "all-module"
  };
  const normalized = aliases[raw] || raw;
  return ALLOWED_CONVERT_TYPES.has(normalized) ? normalized : "";
}

function buildInstallUrl(base, params) {
  return `${base}?${new URLSearchParams(params).toString()}`;
}

function buildScriptHubConvertUrl(sourceUrl, convertType) {
  const type = normalizeConvertType(convertType) || inferConvertTypeFromUrl(sourceUrl) || "all-module";
  const fileName = type === "qx-rewrite" ? "auto-qx.sgmodule" : type === "loon-plugin" ? "auto-loon.sgmodule" : type === "rule-set" ? "auto-rule.sgmodule" : "auto-surge.sgmodule";
  const scriptHubUrl = `http://script.hub/file/_start_/${sourceUrl}/_end_/${fileName}?type=${type}&target=shadowrocket-module&del=true&jqEnabled=true`;
  return buildInstallUrl(DEFAULT_INSTALL_BASE, { module: scriptHubUrl });
}

function inferConvertTypeFromUrl(sourceUrl) {
  const lower = String(sourceUrl || "").toLowerCase();
  if (/\.(plugin|lpx)(?:$|[?#])/.test(lower)) return "loon-plugin";
  if (/\.conf(?:$|[?#])/.test(lower)) return "qx-rewrite";
  if (/\.(list|rule|ruleset)(?:$|[?#])/.test(lower) || lower.includes("rule-set") || lower.includes("ruleset")) return "rule-set";
  if (/\.(sgmodule|module)(?:$|[?#])/.test(lower)) return "surge-module";
  return "all-module";
}

function recognizeExternalModule(input) {
  const sourceUrl = input.sourceUrl || "";
  const content = input.content || "";
  const preferredConvertType = input.preferredConvertType || "";
  const loweredUrl = sourceUrl.toLowerCase();
  const loweredContent = content.toLowerCase();

  if (preferredConvertType) return moduleInfo(kindFromConvertType(preferredConvertType), contentName(content) || nameFromUrl(sourceUrl, preferredConvertType), sourceUrl, preferredConvertType);
  if (loweredUrl.includes(".codex-plugin/") || loweredUrl.endsWith("plugin.json")) return moduleInfo("codex-plugin", nameFromUrl(sourceUrl, "codex-plugin"), sourceUrl, "all-module");
  if (loweredUrl.endsWith("skill.md") || /^---\s*\n[\s\S]*\bname:/i.test(content)) return moduleInfo("skill", frontmatterName(content) || nameFromUrl(sourceUrl, "skill"), sourceUrl, "all-module");
  if (loweredUrl.endsWith(".sgmodule") || loweredUrl.endsWith(".module") || looksLikeSurgeModule(loweredContent)) return moduleInfo("surge-shadowrocket-module", contentName(content) || nameFromUrl(sourceUrl, "surge-module"), sourceUrl, "surge-module");
  if (loweredUrl.endsWith(".plugin") || loweredUrl.endsWith(".lpx") || looksLikeLoonPlugin(loweredContent)) return moduleInfo("loon-plugin", contentName(content) || nameFromUrl(sourceUrl, "loon-plugin"), sourceUrl, "loon-plugin");
  if (loweredUrl.endsWith(".stoverride") || looksLikeStashOverride(loweredContent)) return moduleInfo("stash-override", nameFromUrl(sourceUrl, "stash-override"), sourceUrl, "all-module");
  if (loweredUrl.endsWith(".conf") || looksLikeQuantumultX(loweredContent)) return moduleInfo("quantumult-x-config", contentName(content) || nameFromUrl(sourceUrl, "quantumult-x-config"), sourceUrl, "qx-rewrite");
  if (loweredUrl.endsWith(".list") || loweredUrl.includes("rule-set") || loweredUrl.includes("ruleset")) return moduleInfo("rule-set", nameFromUrl(sourceUrl, "rule-set"), sourceUrl, "rule-set");

  return moduleInfo("unknown-module", contentName(content) || nameFromUrl(sourceUrl, "external-module"), sourceUrl, inferConvertTypeFromUrl(sourceUrl));
}

function kindFromConvertType(convertType) {
  return {
    "surge-module": "surge-shadowrocket-module",
    "qx-rewrite": "quantumult-x-config",
    "loon-plugin": "loon-plugin",
    "rule-set": "rule-set",
    "all-module": "unknown-module"
  }[convertType] || "unknown-module";
}

function assessRisk(moduleInfo, parsed, content) {
  const lower = String(content || "").toLowerCase();
  const summary = parsed.summary || {};
  const requiresMitm = (summary.MITM || 0) > 0 || lower.includes("hostname =") || lower.includes("[mitm]");
  const containsScript = (summary.Script || 0) > 0 || lower.includes("script-path") || lower.includes("script-") || lower.includes("[script]");
  const hasBodyRewrite = (summary["Body Rewrite"] || 0) > 0 || lower.includes("body rewrite") || lower.includes("body-rewrite");
  const hasRewrite = (summary["URL Rewrite"] || 0) > 0 || lower.includes("http-response") || lower.includes("http-request") || lower.includes("url rewrite") || lower.includes("rewrite_local");

  let level = "low";
  const reasons = [];

  if (requiresMitm) reasons.push("需要 MITM 或 hostname 权限");
  if (containsScript) reasons.push("包含脚本执行能力");
  if (hasBodyRewrite) reasons.push("包含 Body Rewrite，可能改写响应内容");
  if (hasRewrite) reasons.push("包含请求/响应重写规则");
  if (["codex-plugin", "skill", "stash-override"].includes(moduleInfo.kind)) reasons.push("不是标准 Shadowrocket 模块，导入前需确认用途");

  if (hasBodyRewrite || (requiresMitm && containsScript)) level = "high";
  else if (requiresMitm || containsScript || hasRewrite) level = "medium";

  return { level, label: riskLabel(level), requiresMitm, containsScript, hasBodyRewrite, hasRewrite, reasons };
}

function riskLabel(level) {
  return level === "high" ? "高风险" : level === "medium" ? "中风险" : "低风险";
}

function parseModuleContent(content) {
  const metadata = {};
  const sections = {};
  let currentSection;
  for (const rawLine of String(content || "").replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) continue;
    const meta = /^#!\s*([^=]+?)\s*=\s*(.*)$/.exec(trimmed);
    if (meta) {
      metadata[meta[1].trim().toLowerCase()] = meta[2].trim();
      continue;
    }
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
  return { metadata, sections, summary };
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

function moduleInfo(kind, name, sourceUrl, convertType) {
  return { kind, name, sourceUrl, convertType };
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
    return cleanName(String(sourceUrl || "").split(/[\\/]/).filter(Boolean).pop() || fallback);
  }
}

function cleanName(name) {
  try {
    return decodeURIComponent(name).replace(/\.(json|md|sgmodule|module|plugin|lpx|stoverride|conf|list)$/i, "").replace(/[._-]+/g, " ").trim() || "external-module";
  } catch {
    return String(name || "external-module").replace(/[._-]+/g, " ").trim() || "external-module";
  }
}

function looksLikeSurgeModule(content) { return content.includes("#!name=") || content.includes("[script]") || content.includes("[mitm]") || content.includes("[url rewrite]"); }
function looksLikeLoonPlugin(content) { return content.includes("[plugin]") || content.includes("hostname ="); }
function looksLikeStashOverride(content) { return content.includes("payload:") && content.includes("behavior:"); }
function looksLikeQuantumultX(content) { return content.includes("[rewrite_local]") || content.includes("[task_local]") || content.includes("[mitm]"); }

function renderHtml(payload) {
  const { module, risk, installUrl, convertUrl, parsed, convertType, mode, hasBody, bodyLength, contentLength } = payload;
  const summary = Object.entries(parsed.summary).map(([name, count]) => `<li>${escapeHtml(name)}: ${count}</li>`).join("");
  const reasons = risk.reasons.length ? risk.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("") : "<li>未发现明显高风险特征，但仍建议检查原始内容。</li>";
  return pageShell("Script Hub Grandpaniu", `
<div class="card"><h2>识别结果</h2><p>模式：${escapeHtml(mode)}</p><p>名称：${escapeHtml(module.name)}</p><p>类型：${escapeHtml(module.kind)}</p><p>转换类型：${escapeHtml(convertType)}</p><p>来源：<code>${escapeHtml(module.sourceUrl)}</code></p></div>
<div class="card"><h2>风险判断：<span class="risk-${escapeHtml(risk.level)}">${escapeHtml(risk.label)}</span></h2><ul>${reasons}</ul><p>MITM：${risk.requiresMitm ? "需要或疑似需要" : "未发现"}；脚本：${risk.containsScript ? "包含或疑似包含" : "未发现"}；Body Rewrite：${risk.hasBodyRewrite ? "包含" : "未发现"}</p></div>
<div class="card"><h2>内容状态</h2><p>是否读取 body：${hasBody ? "是" : "否"}</p><p>body 长度：${bodyLength}</p><p>分析内容长度：${contentLength}</p></div>
<div class="card"><h2>模块段落统计</h2><ul>${summary}</ul></div>
<div class="card"><h2>导入方式</h2>${installUrl ? `<a href="${escapeHtml(installUrl)}">直接导入 Shadowrocket</a>` : ""}${convertUrl ? `<a class="secondary" href="${escapeHtml(convertUrl)}">通过 Script Hub 转换后导入</a>` : ""}<p>建议：外部 QX / Loon / Surge 模块优先使用“通过 Script Hub 转换后导入”。</p></div>`);
}

function renderHealthHtml() {
  return pageShell("Script Hub Grandpaniu 健康检查", `<div class="card"><h2>状态正常</h2><p>本地增强脚本已响应。</p><p>支持入口：/install、/analyze、/health</p><p>支持输出：html、json、url、convert-url</p></div>`);
}

function renderErrorHtml(payload) {
  return pageShell("Script Hub Grandpaniu 错误", `<div class="card"><h2>输入缺失</h2><p>${escapeHtml(payload.message)}</p><h3>示例</h3><code>${escapeHtml(payload.examples.install)}</code><br><br><code>${escapeHtml(payload.examples.analyze)}</code></div>`);
}

function pageShell(title, body) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;padding:24px;background:#111827;color:#e5e7eb}main{max-width:860px;margin:0 auto}.card{border:1px solid #243044;border-radius:12px;background:#0f172a;padding:16px;margin:12px 0}a{display:inline-block;margin:8px 8px 8px 0;padding:10px 14px;border-radius:8px;background:#22c55e;color:#052e16;text-decoration:none;font-weight:800}.secondary{background:#1f2937;color:#dbeafe;border:1px solid #243044}code{word-break:break-all;color:#93c5fd}.risk-low{color:#86efac}.risk-medium{color:#fde68a}.risk-high{color:#fecdd3}p,li{line-height:1.65}</style></head><body><main><h1>${escapeHtml(title)}</h1>${body}</main></body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function output(format, status, payload, html) {
  if (format === "json") return respond(status, "application/json; charset=utf-8", JSON.stringify(payload, null, 2));
  return respond(status, "text/html; charset=utf-8", html);
}

function respond(status, contentType, body) {
  if (typeof $done === "function") {
    return $done({ response: { status, headers: { "Content-Type": contentType }, body } });
  }
  return { status, contentType, body };
}

main();
