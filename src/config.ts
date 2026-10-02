import { isDir, tryFindGameDir, tryFindWorkshopDir } from "./lib/util";
import { LUA_DEFAULT_LIBS, LUA_UNSAFE_LIBS } from "./const";
import { join as pjoin } from "node:path";
import { existsSync } from "node:fs";

export const config = {
  worldSeed: 0,
  gamePath: tryFindGameDir(),
  workshopPath: tryFindWorkshopDir(),

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
