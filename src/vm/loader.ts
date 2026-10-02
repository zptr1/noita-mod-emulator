import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join as pjoin, resolve } from "node:path";
import { loadGameData, loadModData } from "../vfs";
import { Context } from "../context";
import { isDir } from "../lib/util";
import { config } from "../config";

export interface Mod {
  id: string;
  path: string;
  realPath: string;
  ctx: Context;
}

export let gameCtx: Context;
export const activeMods: Mod[] = [];
export const activeModsById = new Map<string, Mod>();

export const availableMods = new Map<string, { path: string, id: string }>();

export function getModId(dir: string) {
  const idPath = pjoin(dir, "mod_id.txt");
  if (existsSync(idPath)) {
    return readFileSync(idPath, "utf8").trim();
  }

  return basename(dir);
}

export function loadModFromDir(path: string, id: string = getModId(path)) {
  path = resolve(path);

  if (!isDir(path)) throw new Error(`Unknown mod: ${path}`);

  if (!existsSync(pjoin(path, "mod.xml"))) {
    throw new Error(`Invalid mod ${path}: missing mod.xml`);
  }

  loadModData(id, path);

  const mod: Mod = {
    id,
    ctx: new Context(id),
    path: `/mods/${id}`,
    realPath: path,
  };

  activeMods.push(mod);
  activeModsById.set(id, mod);
}

export function loadModById(id: string) {
  const mod = availableMods.get(id);
  if (!mod) throw new Error(`Unknown mod: ${id}`);

  loadModFromDir(mod.path, mod.id);
}

export function loadModListFromDir(dir: string) {
  if (!isDir(dir)) return false;

  for (const mod of readdirSync(dir)) {
    const path = pjoin(dir, mod);
    if (!isDir(path)) continue;
    
    let id = mod;
    const idPath = pjoin(path, "mod_id.txt");
    if (existsSync(idPath)) {
      id = readFileSync(idPath, "utf8").trim();
    }

    availableMods.set(id, { path, id });
  }
}

let modsLoaded = false;
export function loadModList(force = false) {
  if (modsLoaded && !force) return;
  modsLoaded = true;

  try {
    loadModListFromDir(pjoin(config.gamePath || "", "mods"));
    loadModListFromDir(config.workshopPath || "");
  } catch {}
}

export function load(mods: string[]) {
  if (!gameCtx) {
    gameCtx = new Context();
    const path = pjoin(config.gamePath || "", "data");
    
    if (!config.gamePath || !isDir(path)) {
      throw new Error(`Could not find Noita's folder. Set it in config.gamePath`);
    }

    loadModList();
    loadGameData(path);
  }

  for (const path of mods) {
    const mod = availableMods.get(path);
    if (mod) loadModFromDir(mod.path, mod.id);
    else loadModFromDir(path);
  }
}
