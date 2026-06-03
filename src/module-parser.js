const SECTION_ALIASES = new Map([
  ["general", "General"],
  ["header rewrite", "Header Rewrite"],
  ["header-rewrite", "Header Rewrite"],
  ["rewrite", "URL Rewrite"],
  ["url rewrite", "URL Rewrite"],
  ["url-rewrite", "URL Rewrite"],
  ["body rewrite", "Body Rewrite"],
  ["body-rewrite", "Body Rewrite"],
  ["script", "Script"],
  ["mitm", "MITM"],
  ["rule", "Rule"],
  ["host", "Host"],
  ["map local", "Map Local"],
  ["map-local", "Map Local"]
]);

export const CORE_SECTIONS = [
  "General",
  "Header Rewrite",
  "URL Rewrite",
  "Body Rewrite",
  "Script",
  "MITM"
];

export function parseModuleContent(content) {
  const lines = String(content ?? "").replace(/\r\n/g, "\n").split("\n");
  const metadata = {};
  const sections = {};
  let currentSection = undefined;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const metadataMatch = /^#!\s*([^=]+?)\s*=\s*(.*)$/.exec(trimmed);
    if (metadataMatch) {
      metadata[metadataMatch[1].trim().toLowerCase()] = metadataMatch[2].trim();
      continue;
    }

    const sectionMatch = /^\[([^\]]+)\]$/.exec(trimmed);
    if (sectionMatch) {
      currentSection = normalizeSectionName(sectionMatch[1]);
      sections[currentSection] ??= [];
      continue;
    }

    if (currentSection) {
      sections[currentSection].push(line);
    }
  }

  return {
    metadata,
    sections,
    summary: summarizeSections(sections)
  };
}

export function buildShadowrocketModule(parsed, options = {}) {
  const metadata = {
    name: options.name ?? parsed.metadata?.name ?? "Script Hub Converted Module",
    desc: options.description ?? parsed.metadata?.desc ?? "Converted by Script Hub Grandpaniu",
    author: options.author ?? parsed.metadata?.author ?? "GrandpaNiu"
  };
  const lines = [
    `#!name=${metadata.name}`,
    `#!desc=${metadata.desc}`,
    `#!author=${metadata.author}`,
    ""
  ];
  const sections = parsed.sections ?? {};
  const ordered = [
    "General",
    "Header Rewrite",
    "URL Rewrite",
    "Body Rewrite",
    "Script",
    "MITM",
    ...Object.keys(sections).filter((name) => !CORE_SECTIONS.includes(name))
  ];

  for (const sectionName of ordered) {
    const entries = sections[sectionName] ?? [];
    if (entries.length === 0) {
      continue;
    }
    lines.push(`[${sectionName}]`);
    lines.push(...entries);
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

function normalizeSectionName(name) {
  const key = name.trim().toLowerCase();
  return SECTION_ALIASES.get(key) ?? name.trim();
}

function summarizeSections(sections) {
  const summary = {};
  for (const sectionName of CORE_SECTIONS) {
    summary[sectionName] = sections[sectionName]?.length ?? 0;
  }
  for (const [sectionName, entries] of Object.entries(sections)) {
    summary[sectionName] ??= entries.length;
  }
  return summary;
}
