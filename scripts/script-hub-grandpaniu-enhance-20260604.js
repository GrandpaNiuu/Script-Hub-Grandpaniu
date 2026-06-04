const DEFAULT_INSTALL_BASE = "shadowrocket://install";
const ALLOWED_CONVERT_TYPES = new Set(["surge-module", "qx-rewrite", "loon-plugin", "rule-set", "all-module"]);

function main() {
  const requestUrl = typeof $request !== "undefined" ? $request.url : "http://grandpaniu.script.hub/health";
  const method = typeof $request !== "undefined" ? String($request.method || "GET").toUpperCase() : "GET";
  const body = typeof $request !== "undefined" ? String($request.body || "") : "";
  const parsedUrl = parseRequestUrl(requestUrl);
  const route = normalizeRoute(parsedUrl.pathname);
  const params = Object.fromEntries(parsedUrl.searchParams.entries());
  const format = normalizeFormat(params.format || "html");

  if (route === "/" || route === "/health") {
    const payload = {
      ok: true,
      name: "Script Hub Grandpaniu Enhance",
      version: "2026-06-04-cache-bust",
      message: "本地增强脚本已正常响应。",
      route,
      routes: ["/", "/health", "/install", "/analyze"],
      recommendedHost: "grandpaniu.script.hub",
      examples: {
        health: "http://grandpaniu.script.hub/health",
        install: "http://grandpaniu.script.hub/install?url=https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/modules/script-hub.rocket.module&convertType=surge-module",
        json: "http://grandpaniu.script.hub/health?format=json"
      }
    };
    return output(format, 200, payload, renderHealthHtml(payload));
  }

  const sourceUrl = normalizeText(params.url || params.module || params.remote || "");
  const content = params.content || body || "";
  const convertType = normalizeConvertType(params.convertType || params.type || "") || inferConvertType(sourceUrl, content);

  if (route === "/install" && !sourceUrl) {
    return missingInput(format, "缺少 url/module 参数。/install 必须这样用：/install?url=模块链接&convertType=surge-module");
  }

  if (route === "/analyze" && !sourceUrl && !content) {
    return missingInput(format, "缺少请求正文。/analyze 适合 POST body；Safari 直接打开通常没有正文。普通用户建议用 /install?url=模块链接。");
  }

  if (!["/install", "/analyze"].includes(route)) {
    const payload = { ok: false, error: "unknown_route", message: `未知入口：${route}。请打开 /health 或 /install?url=模块链接。` };
    return output(format, 404, payload, renderErrorHtml(payload));
  }

  const moduleName = getName(sourceUrl, content, convertType);
  const risk = assessRisk(content);
  const directInstallUrl = sourceUrl ? buildInstallUrl(sourceUrl) : "";
  const convertInstallUrl = sourceUrl ? buildConvertUrl(sourceUrl, convertType) : "";
  const payload = {
    ok: true,
    method,
    route,
    moduleName,
    sourceUrl,
    convertType,
    risk,
    hasBody: Boolean(body),
    bodyLength: body.length,
    contentLength: content.length,
    directInstallUrl,
    convertInstallUrl
  };

  if (format === "url") return respond(200, "text/plain; charset=utf-8", directInstallUrl || convertInstallUrl || "");
  if (format === "convert-url") return respond(200, "text/plain; charset=utf-8", convertInstallUrl || directInstallUrl || "");
  return output(format, 200, payload, renderInstallHtml(payload));
}

function parseRequestUrl(value) {
  try { return new URL(value || "http://grandpaniu.script.hub/health"); }
  catch { return new URL("http://grandpaniu.script.hub/health"); }
}

function normalizeRoute(pathname) {
  const route = String(pathname || "/").replace(/\/+$/, "");
  return route || "/";
}

function normalizeText(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

function normalizeFormat(format) {
  const value = String(format || "html").toLowerCase();
  return ["html", "json", "url", "convert-url"].includes(value) ? value : "html";
}

function normalizeConvertType(value) {
  const raw = String(value || "").trim().toLowerCase();
  const aliases = {
    surge: "surge-module",
    sgmodule: "surge-module",
    module: "surge-module",
    qx: "qx-rewrite",
    quantumultx: "qx-rewrite",
    "quantumult-x": "qx-rewrite",
    rewrite: "qx-rewrite",
    loon: "loon-plugin",
    plugin: "loon-plugin",
    lpx: "loon-plugin",
    ruleset: "rule-set",
    rule: "rule-set",
    list: "rule-set",
    all: "all-module"
  };
  const normalized = aliases[raw] || raw;
  return ALLOWED_CONVERT_TYPES.has(normalized) ? normalized : "";
}

function inferConvertType(sourceUrl, content) {
  const lowerUrl = String(sourceUrl || "").toLowerCase();
  const lowerContent = String(content || "").toLowerCase();
  if (/\.(plugin|lpx)(?:$|[?#])/.test(lowerUrl)) return "loon-plugin";
  if (/\.conf(?:$|[?#])/.test(lowerUrl) || lowerContent.includes("[rewrite_local]")) return "qx-rewrite";
  if (/\.(list|ruleset)(?:$|[?#])/.test(lowerUrl) || lowerUrl.includes("rule-set") || lowerUrl.includes("ruleset")) return "rule-set";
  if (/\.(sgmodule|module)(?:$|[?#])/.test(lowerUrl) || lowerContent.includes("#!name=") || lowerContent.includes("[script]")) return "surge-module";
  return "all-module";
}

function buildInstallUrl(moduleUrl) {
  return `${DEFAULT_INSTALL_BASE}?module=${encodeURIComponent(moduleUrl)}`;
}

function buildConvertUrl(sourceUrl, convertType) {
  const type = normalizeConvertType(convertType) || inferConvertType(sourceUrl, "") || "all-module";
  const fileName = type === "qx-rewrite" ? "auto-qx.sgmodule" : type === "loon-plugin" ? "auto-loon.sgmodule" : type === "rule-set" ? "auto-rule.sgmodule" : "auto-surge.sgmodule";
  const scriptHubUrl = `http://script.hub/file/_start_/${sourceUrl}/_end_/${fileName}?type=${type}&target=shadowrocket-module&del=true&jqEnabled=true`;
  return buildInstallUrl(scriptHubUrl);
}

function getName(sourceUrl, content, fallback) {
  const match = /^#!\s*name\s*=\s*(.+)$/im.exec(String(content || ""));
  if (match) return match[1].trim();
  try {
    const url = new URL(sourceUrl);
    return decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || fallback || "external-module").replace(/\.(sgmodule|module|plugin|lpx|conf|list)$/i, "");
  } catch {
    return fallback || "external-module";
  }
}

function assessRisk(content) {
  const lower = String(content || "").toLowerCase();
  const requiresMitm = lower.includes("[mitm]") || lower.includes("hostname =");
  const containsScript = lower.includes("[script]") || lower.includes("script-path") || lower.includes("script-");
  const hasBodyRewrite = lower.includes("[body rewrite]") || lower.includes("body-rewrite") || lower.includes("body rewrite");
  const hasRewrite = lower.includes("[url rewrite]") || lower.includes("http-request") || lower.includes("http-response") || lower.includes("rewrite_local");
  let level = "low";
  if (hasBodyRewrite || (requiresMitm && containsScript)) level = "high";
  else if (requiresMitm || containsScript || hasRewrite) level = "medium";
  return { level, label: level === "high" ? "高风险" : level === "medium" ? "中风险" : "低风险", requiresMitm, containsScript, hasBodyRewrite, hasRewrite };
}

function missingInput(format, message) {
  const payload = {
    ok: false,
    error: "missing_input",
    message,
    examples: {
      health: "http://grandpaniu.script.hub/health",
      install: "http://grandpaniu.script.hub/install?url=https://raw.githubusercontent.com/Script-Hub-Org/Script-Hub/main/modules/script-hub.rocket.module&convertType=surge-module"
    }
  };
  return output(format, 400, payload, renderErrorHtml(payload));
}

function renderHealthHtml(payload) {
  return pageShell("Script Hub Grandpaniu 健康检查", `
<div class="card good"><h2>状态正常</h2><p>${escapeHtml(payload.message)}</p><p>版本：<code>${escapeHtml(payload.version)}</code></p></div>
<div class="card"><h2>你应该这样用</h2><p>健康检查：</p><code>${escapeHtml(payload.examples.health)}</code><p>真实转换测试：</p><code>${escapeHtml(payload.examples.install)}</code></div>`);
}

function renderInstallHtml(payload) {
  return pageShell("Script Hub Grandpaniu 链接分析", `
<div class="card"><h2>识别结果</h2><p>名称：${escapeHtml(payload.moduleName)}</p><p>转换类型：<code>${escapeHtml(payload.convertType)}</code></p><p>来源：</p><code>${escapeHtml(payload.sourceUrl)}</code></div>
<div class="card"><h2>风险判断：${escapeHtml(payload.risk.label)}</h2><p>MITM：${payload.risk.requiresMitm ? "可能需要" : "未发现"}；脚本：${payload.risk.containsScript ? "可能包含" : "未发现"}；Body Rewrite：${payload.risk.hasBodyRewrite ? "可能包含" : "未发现"}</p></div>
<div class="card"><h2>导入方式</h2><a href="${escapeHtml(payload.directInstallUrl)}">直接导入</a><a class="secondary" href="${escapeHtml(payload.convertInstallUrl)}">通过 Script Hub 转换后导入</a></div>`);
}

function renderErrorHtml(payload) {
  return pageShell("Script Hub Grandpaniu 错误", `<div class="card bad"><h2>输入缺失</h2><p>${escapeHtml(payload.message)}</p><h3>正确示例</h3><code>${escapeHtml(payload.examples.health)}</code><br><br><code>${escapeHtml(payload.examples.install)}</code></div>`);
}

function pageShell(title, body) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;padding:24px;background:#111827;color:#e5e7eb}main{max-width:860px;margin:0 auto}.card{border:1px solid #243044;border-radius:12px;background:#0f172a;padding:16px;margin:12px 0}.good{border-color:#14532d}.bad{border-color:#7f1d1d}a{display:inline-block;margin:8px 8px 8px 0;padding:10px 14px;border-radius:8px;background:#22c55e;color:#052e16;text-decoration:none;font-weight:800}.secondary{background:#1f2937;color:#dbeafe;border:1px solid #243044}code{word-break:break-all;color:#93c5fd}p,li{line-height:1.65}</style></head><body><main><h1>${escapeHtml(title)}</h1>${body}</main></body></html>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function output(format, status, payload, html) {
  if (format === "json") return respond(status, "application/json; charset=utf-8", JSON.stringify(payload, null, 2));
  return respond(status, "text/html; charset=utf-8", html);
}

function respond(status, contentType, body) {
  if (typeof $done === "function") return $done({ response: { status, headers: { "Content-Type": contentType }, body } });
  return { status, contentType, body };
}

main();
