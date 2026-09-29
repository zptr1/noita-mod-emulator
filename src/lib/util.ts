import { existsSync, readFileSync, statSync } from "node:fs";
import { join as pjoin } from "node:path";
import { EMULATOR_PATH } from "../const";

// Moved from vfs/files.ts to fix circular imports
export function resolvePath(path: string) {
  if (path[0] == "/") path = path.slice(1);

  const parts = path.split("/");
  if (parts[0] == "mods" && parts[2] == "data") {
    return parts.slice(2).join("/").toLowerCase();
  }

  return path.toLowerCase();
}

/*
 * Apparently, returning an array from a function acts as a multi-value return on the Lua side;
 * so we need to convert the array to an object if we wanna return a table.
 */
export function arrayToLua<T>(array: T[]): Record<number, T> {
  const table: Record<number, T> = {};
  for (let idx = 0; idx < array.length; idx++) {
    table[idx] = array[idx];
  }

  return table;
}

export function getLuaScript(path: string) {
  return readFileSync(pjoin(EMULATOR_PATH, "lua", path), "utf8");
}

export function isDir(path: string) {
  return existsSync(path) && statSync(path).isDirectory();
}

export function arrayEqual(a: any[], b: any[]) {
  if (a.length != b.length) return;
  for (let i = 0; i < a.length; i++) {
    if (a[i] != b[i]) return;
  }
  return true;
}

export function tryFindDir(list: string[]) {
  for (let path of list) {
    if (path.startsWith("~")) {
      path = pjoin(process.env.HOME!, path.slice(1));
    }

    if (isDir(path)) return path;
  }
}

export function tryFindGameDir() {
  if (process.platform == "win32") {
    return tryFindDir([
      "C:/Program Files (x86)/Steam/steamapps/common/Noita"
    ]);
  }

  return tryFindDir([
    "~/.local/share/Steam/steamapps/common/Noita",
    "~/.var/app/com.valvesoftware.Steam/.local/share/Steam/steamapps/common/Noita"
  ]);
}

export function tryFindWorkshopDir() {
  if (process.platform == "win32") { 
    return tryFindDir([
      "C:/Program Files (x86)/Steam/steamapps/workshop/content/881100/"
    ]);
  }

  return tryFindDir([
    "~/.local/share/Steam/steamapps/workshop/content/881100",
    "~/.var/app/com.valvesoftware.Steam/.local/share/Steam/steamapps/workshop/content/881100"
  ]);
}
