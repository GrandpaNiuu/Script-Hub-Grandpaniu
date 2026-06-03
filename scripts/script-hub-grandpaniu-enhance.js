const DEFAULT_INSTALL_BASE = "shadowrocket://install";

function main() {
  const requestUrl = typeof $request !== "undefined" ? $request.url : "";
  const params = parseQuery(requestUrl);
  const sourceUrl = params.url || params.module || "";
  const content = params.content || "";
  const format = params.format || "html";

  if (!sourceUrl) {
    return respond(400, "text/plain; charset=utf-8", "缺少 url 参数，例如 ?url=https://example.com/demo.sgmodule");
  }

  const moduleInfo = recognizeExternalModule({ sourceUrl, content });
  const installUrl = buildInstallUrl(DEFAULT_INSTALL_BASE, { module: sourceUrl });

  if (format === "json") {
    return respond(200, "application/json; charset=utf-8", JSON.stringify({
      module: moduleInfo,
      installUrl
    }, null, 2));
  }

  if (format === "url") {
    return respond(200, "text/plain; charset=utf-8", installUrl);
  }

  return respond(200, "text/html; charset=utf-8", renderHtml(moduleInfo, installUrl));
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
  const query = new URLSearchParams(params);
  return `${base}?${query.toString()}`;
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

  if (loweredUrl.endsWith(".sgmodule") || looksLikeSurgeModule(loweredContent)) {
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

function moduleInfo(kind, name, sourceUrl) {
  return { kind, name, sourceUrl };
}

function contentName(content) {
  const match = /^#!\s*name\s*=\s*(.+)$/im.exec(content);
  return match && match[1] ? match[1].trim() : undefined;
}

function frontmatterName(content) {
  const match = /^---\s*\n[\s\S]*?^name:\s*(.+)$/im.exec(content);
  return match && match[1] ? match[1].trim().replace(/^["']|["']$/g, "") : undefined;
}

function nameFromUrl(sourceUrl, fallback) {
  try {
    const url = new URL(sourceUrl);
    const segment = url.pathname.split("/").filter(Boolean).pop();
    return cleanName(segment || fallback);
  } catch {
    const segment = sourceUrl.split(/[\\/]/).filter(Boolean).pop();
    return cleanName(segment || fallback);
  }
}

function cleanName(name) {
  return decodeURIComponent(name)
    .replace(/\.(json|md|sgmodule|plugin|stoverride|conf)$/i, "")
    .replace(/[._-]+/g, " ")
    .trim() || "external-module";
}

function looksLikeSurgeModule(content) {
  return content.includes("#!name=") &&
    (content.includes("[script]") || content.includes("[rule]") || content.includes("[mitm]"));
}

function looksLikeLoonPlugin(content) {
  return content.includes("[plugin]") || content.includes("hostname =");
}

function looksLikeStashOverride(content) {
  return content.includes("payload:") && content.includes("behavior:");
}

function looksLikeQuantumultX(content) {
  return content.includes("[rewrite_local]") ||
    content.includes("[task_local]") ||
    content.includes("[mitm]");
}

function renderHtml(moduleInfo, installUrl) {
  return `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Script Hub Grandpaniu</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;padding:24px;background:#111827;color:#e5e7eb}
main{max-width:720px;margin:0 auto}
h1{font-size:22px;margin:0 0 16px}
p{line-height:1.7}
a{display:inline-block;margin-top:12px;padding:10px 14px;border-radius:8px;background:#22c55e;color:#052e16;text-decoration:none;font-weight:700}
code{word-break:break-all;color:#93c5fd}
</style>
<main>
<h1>Script Hub Grandpaniu</h1>
<p>已识别：${escapeHtml(moduleInfo.name)}（${escapeHtml(moduleInfo.kind)}）</p>
<p>来源：<code>${escapeHtml(moduleInfo.sourceUrl)}</code></p>
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
    return $done({
      response: {
        status,
        headers: { "Content-Type": contentType },
        body
      }
    });
  }
  return { status, contentType, body };
}

main();
