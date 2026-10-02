import { EMULATOR_PATH, EXPECTED_LUA_VERSION, EXPECTED_LUAJIT_VERSION, RE_INVALID_FILE_CHARS, RE_RESERVED_NAME_WINDOWS } from "../const";
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, join as pjoin, relative } from "node:path";
import { LuaState } from "lua-state";
import cl from "chalk";
import { printWarn } from "../log";

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

let versionChecked = false;
export function checkLuaVersion() {
  if (versionChecked) return;
  versionChecked = true;

  const version = new LuaState().getVersion();
  console.log(cl.gray("Running", version));
  if (!version.includes(EXPECTED_LUA_VERSION) || !version.includes(EXPECTED_LUAJIT_VERSION)) {
    console.error(`Invalid version. Expected ${EXPECTED_LUA_VERSION} compiled with ${EXPECTED_LUAJIT_VERSION}`);
    console.error(`Recompile the lua-state library with the correct version:`);

    const scriptPath = relative(process.cwd(), pjoin(EMULATOR_PATH, "scripts/build-lua.mjs"));
    console.error(cl.yellow(` > ${basename(process.execPath)} ${scriptPath}`));

    process.exit(1);
  }
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

// better safe than sorry lol
export function validatePath(path: string, outDir: string) {
  const parts = path.split("/");
  const out: string[] = [];

  for (const str of parts) {
    const part = str.trim();

    if (!part || part == ".") continue;
    if (part == "..") {
      out.pop();
      continue;
    }

    if (part.length > 255) {
      printWarn("VFS", `Invalid file: ${path} (too long)`);
      return false;
    }

    if (RE_INVALID_FILE_CHARS.test(part) || part.endsWith(".")) {
      printWarn("VFS", `Invalid file: ${path} (invalid characters)`);
      return false;
    }

    if (process.platform == "win32" && RE_RESERVED_NAME_WINDOWS.test(part)) {
      printWarn("VFS", `Invalid file: ${path} (reserved file name)`);
      return false;
    }

    out.push(part);
  }

  if (out.length > 20) {
    printWarn("VFS", `Invalid file: ${path} (too deep)`);
    return false;
  }

  const res = out.join("/");
  const outPath = pjoin(outDir, res);
  if (!outPath.startsWith(outDir)) {
    printWarn("VFS", `Invalid file: ${path} (escaped bounds somehow??? resolved as ${outPath})`);
    return false;
  }

  return outPath;
}
