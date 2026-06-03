export type DetectedKind =
  | "codex-plugin"
  | "skill"
  | "mcp-server"
  | "generic-plugin"
  | "surge-module"
  | "loon-plugin"
  | "stash-override"
  | "quantumult-x-config"
  | "unknown-module";

export interface DetectedModule {
  kind: DetectedKind;
  name: string;
  version?: string;
  description?: string;
  entry?: string;
  sourcePath: string;
  metadata: Record<string, unknown>;
}

export interface RocketInstallOptions {
  sourceUrl: string;
  installBase?: string;
  extraParams?: Record<string, string>;
}

export interface RocketInstallPayload {
  module: DetectedModule;
  installUrl: string;
  params: Record<string, string>;
}

export interface RecognizeInput {
  sourceUrl?: string;
  url?: string;
  content?: string;
}

export function detectModule(targetPath: string): Promise<DetectedModule>;
export function discoverModules(
  targetPath: string,
  options?: { recursive?: boolean }
): Promise<DetectedModule[]>;
export function toRocketInstallPayload(
  module: DetectedModule,
  options: RocketInstallOptions
): RocketInstallPayload;
export function toShadowrocketInstallPayload(
  module: DetectedModule,
  options: RocketInstallOptions
): RocketInstallPayload;
export function formatPayload(
  payload: RocketInstallPayload,
  format?: "json" | "url" | "params"
): string;
export function recognizeExternalModule(input: RecognizeInput): DetectedModule;
