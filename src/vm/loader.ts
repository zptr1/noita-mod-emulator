import { Context } from "../context";
import * as VFS from "../vfs";

export interface Mod {
  id: string;
  path: string;
  realPath: string;
  ctx: Context;
}

export let gameCtx: Context;
export const mods: Mod[] = [];
export const modById = new Map<string, Mod>();

export function load(gameDataPath: string, modPaths: string[]) {
  gameCtx = new Context();
  VFS.loadGameData(gameDataPath);

  for (const path of modPaths) {
    const id = VFS.loadMod(path);
    const mod: Mod = {
      id,
      ctx: new Context(id),
      path: `/mods/${id}`,
      realPath: path,
    };

    mods.push(mod);
    modById.set(id, mod);
  }
}
