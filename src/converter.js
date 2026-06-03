const DEFAULT_INSTALL_BASE = "shadowrocket://install";

export function toRocketInstallPayload(module, options) {
  if (!module?.name) {
    throw new Error("module.name is required");
  }
  if (!options?.sourceUrl) {
    throw new Error("options.sourceUrl is required");
  }

  const params = {
    name: module.name,
    kind: module.kind,
    source: options.sourceUrl
  };

  if (module.version) {
    params.version = module.version;
  }

  if (module.description) {
    params.description = module.description;
  }

  for (const [key, value] of Object.entries(options.extraParams ?? {})) {
    params[key] = value;
  }

  return {
    module,
    params,
    installUrl: buildInstallUrl(options.installBase ?? DEFAULT_INSTALL_BASE, params)
  };
}

export function toShadowrocketInstallPayload(module, options) {
  if (!module?.name) {
    throw new Error("module.name is required");
  }
  if (!options?.sourceUrl) {
    throw new Error("options.sourceUrl is required");
  }

  const params = {
    module: options.sourceUrl
  };

  for (const [key, value] of Object.entries(options.extraParams ?? {})) {
    params[key] = value;
  }

  return {
    module,
    params,
    installUrl: buildInstallUrl(options.installBase ?? DEFAULT_INSTALL_BASE, params)
  };
}

export function formatPayload(payload, format = "json") {
  if (format === "url") {
    return payload.installUrl;
  }

  if (format === "params") {
    return new URLSearchParams(payload.params).toString();
  }

  if (format === "json") {
    return JSON.stringify(payload, null, 2);
  }

  throw new Error(`Unsupported output format: ${format}`);
}

function buildInstallUrl(base, params) {
  const separator = base.includes("?") ? "&" : "?";
  const query = new URLSearchParams(params);
  return `${base}${separator}${query.toString()}`;
}
