import { gameCtx, activeMods } from "./loader";
import { LUA_HOOKS, LuaHook } from "../const";
import { printError, printLog } from "../log";
import { Context } from "../context";
import { fileExists } from "../vfs";
import { initHooks } from "./hooks";

let running = false;

const hookPreCallbacks = new Map<LuaHook, Function[]>();
const hookPostCallbacks = new Map<LuaHook, Function[]>();

for (const hook of LUA_HOOKS) {
  hookPreCallbacks.set(hook, []);
  hookPostCallbacks.set(hook, []);
}

export const preHook = (hook: LuaHook, cb: Function) => hookPreCallbacks.get(hook)!.push(cb);
export const postHook = (hook: LuaHook, cb: Function) => hookPostCallbacks.get(hook)!.push(cb);

function runCallbacks(args: any[], list?: Function[]) {
  if (!list) return;
  for (const cb of list) {
    try { cb(...args) }
    catch (err) {
      printError(`${err.stack || err}`);
    }
  }
}

export function stop() {
  running = false;
}

export function runHook(hook: LuaHook, ...args: any[]) {
  runSettings();
  runCallbacks(args, hookPreCallbacks.get(hook));

  try {
    gameCtx.runHook(hook, ...args);
  } catch (err) {
    printError("VM", `Error running hook ${hook} for vanilla game: ${err}`);
  }

  for (const mod of activeMods) {
    try {
      mod.ctx.runHook(hook, ...args);
    } catch (err) {
      printError("VM", `Error running hook ${hook} for ${mod.id}: ${err}`);
    }
  }
  
  runCallbacks(args, hookPostCallbacks.get(hook));
}

let ranSettings = false;

export function runSettings() {
  if (ranSettings) return;

  ranSettings = true;
  initHooks();
  printLog("VM", `Running mod's settings.lua`);

  for (const mod of activeMods) {
    const path = `${mod.path}/settings.lua`;

    if (!fileExists(path)) continue;

    const ctx = new Context(`${mod.id}:settings`);
  
    try {
      ctx.execFile(path);
      ctx.runHook("ModSettingsUpdate", 0);
    } catch (err) {
      printError("VM", `Error running settings for ${mod}: ${err}`);
    }
  }
}

export function run() {
  running = true;

  initHooks();
  runSettings();

  for (const hook of LUA_HOOKS) {
    if (!running) break;

    printLog("VM", "Running hook", hook);
    runHook(hook);
  }
}
