import { gameCtx, activeMods } from "./loader";
import { LUA_HOOKS, LuaHook } from "../const";
import { printError, printErrorPlain, printLog } from "../log";
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
      printErrorPlain(`${err.stack || err}`);
    }
  }
}

export function stopRunningHooks() {
  running = false;
}

export function runHook(hook: LuaHook, ...args: any[]) {
  runCallbacks(args, hookPreCallbacks.get(hook));

  try {
    gameCtx.runHook(hook, ...args);
  } catch (err) {
    printError("VM", "Error running hook", hook, "for vanilla game");
    printErrorPlain(err.toString());
  }

  for (const mod of activeMods) {
    try {
      mod.ctx.runHook(hook, ...args);
    } catch (err) {
      printError("VM", "Error running hook", hook, "for", mod.id);
      printErrorPlain(err.toString());
    }
  }
  
  runCallbacks(args, hookPostCallbacks.get(hook));
}

let ranSettings = false;

export function runSettings() {
  if (ranSettings) return;

  ranSettings = true;
  printLog("VM", `Running mod's settings.lua`);

  for (const mod of activeMods) {
    const path = `${mod.path}/settings.lua`;

    if (!running) break;
    if (!fileExists(path)) continue;
  
    const ctx = new Context(`${mod.id}:settings`);
  
    try {
      ctx.execFile(path);
      ctx.runHook("ModSettingsUpdate", 0);
    } catch (err) {
      printError("VM", `Error running settings for ${mod}`);
      printErrorPlain(err.toString());
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
    try {
      runHook(hook);
    } catch (err) {
      printErrorPlain(err.toString());
    }
  }
}
