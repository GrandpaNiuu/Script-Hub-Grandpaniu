const DEFAULT_INSTALL_BASE = "rocket://install";

export function toRocketInstallPayload(module, options) {
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

function buildInstallUrl(base, params) {
  const separator = base.includes("?") ? "&" : "?";
  const query = new URLSearchParams(params);
  return `${base}${separator}${query.toString()}`;
}
