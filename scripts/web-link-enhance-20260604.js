const PANEL_ID = "grandpaniu-web-addon-panel";
const LOCAL_HOST = "http://grandpaniu.script.hub";
const MAX_ITEMS = 30;

function main() {
  const request = typeof $request !== "undefined" ? $request : {};
  const response = typeof $response !== "undefined" ? $response : {};
  const url = request.url || "";
  const headers = normalizeHeaders(response.headers || {});
  const contentType = headers["content-type"] || "";
  let body = String(response.body || "");

  if (!shouldProcess(url, contentType, body)) return done(body, headers);
  if (body.includes(PANEL_ID)) return done(body, headers);

  const items = detectModuleLinks(body).slice(0, MAX_ITEMS);
  if (!items.length) return done(body, headers);

  const panel = buildPanel(items);
  if (/<\/body>/i.test(body)) body = body.replace(/<\/body>/i, panel + "</body>");
  else body += panel;

  delete headers["content-length"];
  delete headers["content-security-policy"];
  delete headers["content-security-policy-report-only"];
  return done(body, headers);
}

function normalizeHeaders(headers) {
  const output = {};
  for (const [key, value] of Object.entries(headers || {})) output[String(key).toLowerCase()] = value;
  return output;
}

function shouldProcess(url, contentType, body) {
  const lowerUrl = String(url || "").toLowerCase();
  if (lowerUrl.includes("grandpaniu.script.hub")) return false;
  if (lowerUrl.includes("script.hub/file/_start_")) return false;
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico|css|woff2?|ttf|mp4|mov|zip|gz|br)(?:$|[?#])/i.test(lowerUrl)) return false;
  if (contentType && !/text\/html|application\/xhtml\+xml|text\/plain|application\/json/i.test(contentType)) return false;
  if (!body || body.length < 20) return false;
  return /https?:\/\/[^\s"'<>]+\.(?:sgmodule|module|plugin|lpx|conf|list)|surge:\/\/\/install-module|loon:\/\/import|quantumult-x:\/\/\/add-resource/i.test(body);
}

function detectModuleLinks(text) {
  const seen = new Set();
  const items = [];
  const add = (raw, type, source) => {
    const url = cleanUrl(raw);
    if (!url || seen.has(url)) return;
    seen.add(url);
    items.push({ url, convertType: type || inferConvertType(url), source: source || "url" });
  };

  const normalUrlRegex = /https?:\/\/[^\s"'<>\\]+?\.(?:sgmodule|module|plugin|lpx|conf|list)(?:\?[^\s"'<>\\]*)?/gi;
  let match;
  while ((match = normalUrlRegex.exec(text)) !== null) add(match[0], inferConvertType(match[0]), "plain-url");

  const surgeRegex = /surge:\/\/\/install-module\?url=([^\s"'<>]+)/gi;
  while ((match = surgeRegex.exec(text)) !== null) add(decodeSafe(match[1]), "surge-module", "surge-scheme");

  const loonRegex = /loon:\/\/import\?plugin=([^\s"'<>]+)/gi;
  while ((match = loonRegex.exec(text)) !== null) add(decodeSafe(match[1]), "loon-plugin", "loon-scheme");

  const qxRegex = /quantumult-x:\/\/\/add-resource\?[^\s"'<>]*remote-resource=([^&\s"'<>]+)[^\s"'<>]*/gi;
  while ((match = qxRegex.exec(text)) !== null) add(decodeSafe(match[1]), "qx-rewrite", "quantumult-x-scheme");

  return items;
}

function cleanUrl(value) {
  let url = decodeSafe(String(value || "").trim());
  url = url.replace(/&amp;/g, "&").replace(/[),.;，。；]+$/g, "");
  if (!/^https?:\/\//i.test(url)) return "";
  return url;
}

function decodeSafe(value) {
  try { return decodeURIComponent(value); } catch { return String(value || ""); }
}

function inferConvertType(url) {
  const lower = String(url || "").toLowerCase();
  if (/\.(plugin|lpx)(?:$|[?#])/.test(lower)) return "loon-plugin";
  if (/\.conf(?:$|[?#])/.test(lower)) return "qx-rewrite";
  if (/\.(list)(?:$|[?#])/.test(lower) || lower.includes("rule-set") || lower.includes("ruleset")) return "rule-set";
  if (/\.(sgmodule|module)(?:$|[?#])/.test(lower)) return "surge-module";
  return "all-module";
}

function buildPanel(items) {
  const rows = items.map((item, index) => {
    const title = escapeHtml(shortName(item.url) || `模块 ${index + 1}`);
    const url = escapeHtml(item.url);
    const type = escapeHtml(item.convertType);
    const analysis = `${LOCAL_HOST}/install?url=${encodeURIComponent(item.url)}&convertType=${encodeURIComponent(item.convertType)}`;
    const direct = `shadowrocket://install?module=${encodeURIComponent(item.url)}`;
    const copy = item.url.replace(/`/g, "&#096;");
    return `<div class="gpn-item"><div class="gpn-title">${index + 1}. ${title}</div><div class="gpn-type">${type}</div><code>${url}</code><div class="gpn-actions"><a href="${analysis}">分析/转换</a><a href="${direct}">直接导入</a><button onclick="navigator.clipboard&&navigator.clipboard.writeText(\`${copy}\`);this.textContent='已复制'">复制链接</button></div></div>`;
  }).join("");

  return `<style>
#${PANEL_ID}{position:fixed;right:14px;bottom:14px;z-index:2147483647;width:min(360px,92vw);max-height:70vh;overflow:auto;background:#0f172a;color:#e5e7eb;border:1px solid #334155;border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.45);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:13px;line-height:1.45}
#${PANEL_ID} *{box-sizing:border-box}#${PANEL_ID} .gpn-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 12px;border-bottom:1px solid #334155;background:#111827;position:sticky;top:0}#${PANEL_ID} .gpn-head strong{font-size:14px}#${PANEL_ID} .gpn-head button{border:1px solid #334155;background:#1f2937;color:#e5e7eb;border-radius:8px;padding:4px 8px}#${PANEL_ID} .gpn-body{padding:10px}#${PANEL_ID} .gpn-item{border:1px solid #243044;border-radius:10px;background:#111827;padding:10px;margin:8px 0}#${PANEL_ID} .gpn-title{font-weight:700;color:#fff;margin-bottom:4px}#${PANEL_ID} .gpn-type{display:inline-block;border:1px solid #334155;border-radius:999px;padding:2px 8px;color:#93c5fd;margin:2px 0 6px}#${PANEL_ID} code{display:block;word-break:break-all;color:#93c5fd;background:#020617;border:1px solid #1e293b;border-radius:8px;padding:7px;margin:5px 0}#${PANEL_ID} .gpn-actions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px}#${PANEL_ID} .gpn-actions a,#${PANEL_ID} .gpn-actions button{text-align:center;text-decoration:none;border:0;border-radius:8px;padding:8px 6px;background:#22c55e;color:#052e16;font-weight:800;font-size:12px}#${PANEL_ID} .gpn-actions a:nth-child(2){background:#f59e0b;color:#1f1300}#${PANEL_ID} .gpn-actions button{background:#1f2937;color:#dbeafe;border:1px solid #334155}#${PANEL_ID}.gpn-min .gpn-body{display:none}#${PANEL_ID}.gpn-min{width:auto;max-height:none}#${PANEL_ID}.gpn-min .gpn-head{border-bottom:0;border-radius:14px}
</style><div id="${PANEL_ID}"><div class="gpn-head"><strong>Grandpaniu 模块助手 · ${items.length}</strong><button onclick="document.getElementById('${PANEL_ID}').classList.toggle('gpn-min')">收起</button></div><div class="gpn-body">${rows}</div></div>`;
}

function shortName(url) {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() || u.hostname);
  } catch {
    return String(url || "").slice(0, 60);
  }
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function done(body, headers) {
  if (typeof $done === "function") return $done({ response: { headers, body } });
}

main();
