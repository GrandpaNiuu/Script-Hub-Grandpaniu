export function recognizeExternalModule(input) {
  const sourceUrl = input.sourceUrl ?? input.url ?? "";
  const content = input.content ?? "";
  const loweredUrl = sourceUrl.toLowerCase();
  const loweredContent = content.toLowerCase();
  const json = parseJson(content);

  if (json?.mcpServers) {
    return fromMetadata("mcp-server", firstKey(json.mcpServers) ?? "mcp-server", sourceUrl, json);
  }

  if (json?.name || json?.id) {
    return fromMetadata("generic-plugin", json.name ?? json.id, sourceUrl, json);
  }

  if (loweredUrl.includes(".codex-plugin/") || loweredUrl.endsWith("plugin.json")) {
    return fromMetadata("codex-plugin", nameFromUrl(sourceUrl, "codex-plugin"), sourceUrl, {});
  }

  if (loweredUrl.endsWith("skill.md") || /^---\s*\n[\s\S]*\bname:/i.test(content)) {
    return fromMetadata("skill", frontmatterName(content) ?? nameFromUrl(sourceUrl, "skill"), sourceUrl, {});
  }

  if (loweredUrl.endsWith(".sgmodule") || looksLikeSurgeModule(loweredContent)) {
    return fromMetadata("surge-module", contentName(content) ?? nameFromUrl(sourceUrl, "surge-module"), sourceUrl, {});
  }

  if (loweredUrl.endsWith(".plugin") || looksLikeLoonPlugin(loweredContent)) {
    return fromMetadata("loon-plugin", contentName(content) ?? nameFromUrl(sourceUrl, "loon-plugin"), sourceUrl, {});
  }

  if (loweredUrl.endsWith(".stoverride") || looksLikeStashOverride(loweredContent)) {
    return fromMetadata("stash-override", nameFromUrl(sourceUrl, "stash-override"), sourceUrl, {});
  }

  if (loweredUrl.endsWith(".conf") || looksLikeQuantumultX(loweredContent)) {
    return fromMetadata("quantumult-x-config", contentName(content) ?? nameFromUrl(sourceUrl, "quantumult-x-config"), sourceUrl, {});
  }

  return fromMetadata("unknown-module", nameFromUrl(sourceUrl, "external-module"), sourceUrl, {});
}

function fromMetadata(kind, name, sourceUrl, metadata) {
  return {
    kind,
    name,
    description: descriptionFrom(metadata),
    sourcePath: sourceUrl,
    metadata
  };
}

function parseJson(content) {
  if (!content.trim().startsWith("{")) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function firstKey(value) {
  return value && typeof value === "object" ? Object.keys(value)[0] : undefined;
}

function contentName(content) {
  const match = /^#!\s*name\s*=\s*(.+)$/im.exec(content);
  return match?.[1]?.trim();
}

function frontmatterName(content) {
  const match = /^---\s*\n[\s\S]*?^name:\s*(.+)$/im.exec(content);
  return match?.[1]?.trim().replace(/^["']|["']$/g, "");
}

function descriptionFrom(metadata) {
  return typeof metadata?.description === "string" ? metadata.description : undefined;
}

function nameFromUrl(sourceUrl, fallback) {
  if (!sourceUrl) {
    return fallback;
  }

  try {
    const url = new URL(sourceUrl);
    const segment = url.pathname.split("/").filter(Boolean).pop();
    return cleanName(segment ?? fallback);
  } catch {
    const segment = sourceUrl.split(/[\\/]/).filter(Boolean).pop();
    return cleanName(segment ?? fallback);
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
