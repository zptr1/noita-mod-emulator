import { fileBlame, fileExists, getFile, realFilePath, setFile } from "../vfs";
import { arrayToLua, resolvePath } from "../lib/util";
import { LUA_APPENDS } from "../storage";
import { Context } from "../context";
import { printDebug } from "../log";

export function __normalize_path(path: string) {
  path = resolvePath(path);
  return [path, realFilePath.get(path) || `vanilla/${path}`];
}

export function ctx$ModTextFileSetContent(ctx: Context, path: string, content: string) {
  path = resolvePath(path);
  setFile(path, content, ctx.id);
}

export const ModTextFileGetContent = (path: string) => getFile(path);
export const ModDoesFileExist = (path: string) => fileExists(path);

export function ModTextFileWhoSetContent(path: string) {
  return fileBlame.get(resolvePath(path)) || "";
}

export function ctx$do_mod_appends(ctx: Context, path: string) {
  const appends = LUA_APPENDS.get(resolvePath(path));
  if (!appends) return;

  for (const append of appends) {
    ctx.dofile(append);
  }
}

export function ModLuaFileAppend(path: string, script: string) {
  path = resolvePath(path);
  script = resolvePath(script);

  if (!LUA_APPENDS.has(path)) {
    LUA_APPENDS.set(path, new Set());
  }

  LUA_APPENDS.get(path)!.add(script);
}

export function ModLuaFileSetAppends(path: string, appends: string[]) {
  LUA_APPENDS.set(resolvePath(path), new Set(appends.map(resolvePath)));
}

export function ModLuaFileGetAppends(path: string) {
  const appends = LUA_APPENDS.get(resolvePath(path));
  if (!appends) return {};
  return arrayToLua([...appends]);
}

export function ctx$SetTimeOut(ctx: Context, delay: number, path: string, fname?: string) {
  printDebug("LUA", `Scheduled ${path} in ${delay}s`);
  
  setTimeout(() => {
    const timeCtx = new Context(ctx.id.replace(":timeout", "") + ":timeout");
    timeCtx.dofile(path);
    if (fname) {
      timeCtx.runHook(fname);
    }
  }, delay * 1000);
}
