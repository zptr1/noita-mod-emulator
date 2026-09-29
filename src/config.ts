import { tryFindGameDir, tryFindWorkshopDir } from "./lib/util";
import { LuaLibName } from "lua-state";

export const config = {
  worldSeed: 0,
  gamePath: tryFindGameDir(),
  workshopPath: tryFindWorkshopDir(),
  enableImageEditing: true,
  enableLocalization: true,
  enableBiomeMap: true,

  luaLibs: ["base", "string", "table", "math", "utf8", "bit32"] as LuaLibName[],
};

export function setConfig(newConfig: Partial<typeof config>) {
  for (const key in newConfig) {
    config[key] = newConfig[key];
  }
}
