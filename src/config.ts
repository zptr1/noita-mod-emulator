import { LocaleKey, LUA_DEFAULT_LIBS, LUA_UNSAFE_LIBS } from "./const";
import { isDir, tryFindGameDir, tryFindWorkshopDir } from "./lib/util";
import { join as pjoin } from "node:path";
import { existsSync } from "node:fs";

export enum LogLevel {
  Debug = 0,
  Trace = 1,
  Info = 2,
  Warn = 3,
  Error = 4,
}

export const config = {
  logLevel: LogLevel.Debug,
  gamePath: tryFindGameDir(),
  workshopPath: tryFindWorkshopDir(),
  worldSeed: 0,
  language: "en" as LocaleKey,
  fatalErrors: false,

  enableImageEditing: true,
  enablePRNG: true,
  enableLocalization: true,
  enableBiomeMap: true,

  collectFileLog: false,
  luaUnsafeLibs: false,
};

export const defaultConfig = { ...config };

export function setConfig(newConfig: Partial<typeof config>) {
  for (const key in newConfig) {
    config[key] = newConfig[key];
  }
}

export function validateConfig() {
  if (!config.gamePath) return "Could not detect the game path automatically, please specify it.";
  if (!isDir(config.gamePath)) return "Invalid game path: directory does not exist";
  if (!existsSync(pjoin(config.gamePath, "data/data.wak"))) return "Specified game path does not have data/data.wak";
}

export function getLuaLibs() {
  return config.luaUnsafeLibs
    ? LUA_UNSAFE_LIBS
    : LUA_DEFAULT_LIBS;
}
