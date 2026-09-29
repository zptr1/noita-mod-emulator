import { LUA_HOOKS, LuaHook } from "../const";
import { fileExists, getFile } from "../vfs";
import { gameCtx, mods } from "./loader";
import { Context } from "../context";
import { printLog } from "../log";
import * as API from "../api";
import { loadBiomeMap } from "./reflect/biomemap";

const hookPreCallbacks = new Map<LuaHook, Function[]>();
const hookPostCallbacks = new Map<LuaHook, Function[]>();

for (const hook of LUA_HOOKS) {
  hookPreCallbacks.set(hook, []);
  hookPostCallbacks.set(hook, []);
}

export const preHook = (hook: LuaHook, cb: Function) => hookPreCallbacks.get(hook)!.push(cb);
export const postHook = (hook: LuaHook, cb: Function) => hookPostCallbacks.get(hook)!.push(cb);

export function runHook(hook: LuaHook, ...args: any[]) {
  const pre = hookPreCallbacks.get(hook)!;
  for (const cb of pre) cb(...args);
  
  gameCtx.runHook(hook, ...args);
  for (const mod of mods) {
    mod.ctx.runHook(hook, ...args);
  }
  
  const post = hookPostCallbacks.get(hook)!;
  for (const cb of post) cb(...args);
}

export function run() {
  printLog("Runner", `Running mod's settings.lua`);

  for (const mod of mods) {
    const path = `${mod.path}/settings.lua`;
    if (!fileExists(path)) continue;
  
    const ctx = new Context(`${mod.id}:settings`);
  
    try {
      ctx.execFile(path);
      ctx.runHook("ModSettingsUpdate", 0);
    } catch (err) {
      console.error(err.toString());
      return;
    }
  }

  for (const hook of LUA_HOOKS) {
    printLog("Runner", "Running hook", hook);
    try {
      runHook(hook);
    } catch (err) {
      console.error(err.toString());
      return;
    }
  }
}

preHook("OnModPreInit", () => {
  API.ModMagicNumbersFileAdd("data/magic_numbers.xml");
  gameCtx.execFile("data/scripts/init.lua");

  for (const mod of mods) {
    mod.ctx.execFile(`${mod.path}/init.lua`);
  }
});

preHook("OnMagicNumbersAndWorldSeedInitialized", () => {
  API.$loadMagicNumbers();
});

postHook("OnMagicNumbersAndWorldSeedInitialized", () => {
  // TODO: does this run before or after? or somewhere else entirely?
  loadBiomeMap();
});
