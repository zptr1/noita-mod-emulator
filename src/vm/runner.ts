import { LUA_HOOKS, LuaHook } from "../const";
import { gameCtx, activeMods } from "./loader";
import { Context } from "../context";
import { fileExists } from "../vfs";
import { printLog } from "../log";
import { initHooks } from "./hooks";

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

  try {
    gameCtx.runHook(hook, ...args);
  } catch (err) {
    console.error("Error running hook", hook, "for vanilla game");
    console.error(err);
  }

  for (const mod of activeMods) {
    try {
      mod.ctx.runHook(hook, ...args);
    } catch (err) {
      console.error("Error running hook", hook, "for", mod.id);
      console.error(err);
    }
  }
  
  const post = hookPostCallbacks.get(hook)!;
  for (const cb of post) cb(...args);
}

let ranSettings = false;

export function runSettings() {
  if (ranSettings) return;

  ranSettings = true;
  printLog("VM", `Running mod's settings.lua`);

  for (const mod of activeMods) {
    const path = `${mod.path}/settings.lua`;
    if (!fileExists(path)) continue;
  
    const ctx = new Context(`${mod.id}:settings`);
  
    try {
      ctx.execFile(path);
      ctx.runHook("ModSettingsUpdate", 0);
    } catch (err) {
      console.error(err.toString());
    }
  }
}

export function run() {
  initHooks();
  runSettings();

  for (const hook of LUA_HOOKS) {
    printLog("VM", "Running hook", hook);
    try {
      runHook(hook);
    } catch (err) {
      console.error(err.toString());
    }
  }
}
