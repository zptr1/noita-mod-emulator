import { createProfiler, Profiler, profilerEnabled } from "./profiler";
import { LuaFunction, LuaState } from "lua-state";
import { config, getLuaLibs } from "../config";
import { checkLuaVersion } from "../lib/util";
import { luaBitLib } from "../lib/bit";
import { printError } from "../log";
import { getLuaInit } from "./lua";
import * as API from "../api";

export class Context {
  public readonly lua = new LuaState({ libs: getLuaLibs() });

  private readonly definedGlobals = new Set<string>();
  private profiler?: Profiler;

  public readonly dofile: LuaFunction;
  public readonly dofileOnce: LuaFunction;

  constructor(
    public readonly id: string = "?",
  ) {
    this.lua.eval(getLuaInit());
    this.initProfiler();

    this.dofile = this.lua.getGlobal("dofile") as any;
    this.dofileOnce = this.lua.getGlobal("dofile_once") as any;

    if (typeof this.dofile != "function" || typeof this.dofileOnce != "function") {
      throw new Error("Context failed to initialize: missing dofile function(s)");
    }

    this.initGlobals();
    checkLuaVersion();
  }

  private initProfiler() {
    if (!profilerEnabled) return;

    this.profiler = createProfiler(this);
    this.lua.setGlobal("__perf_begin", this.profiler.begin as any);
    this.lua.setGlobal("__perf_end", this.profiler.end as any);
    this.lua.setGlobal("__perf_immediate", this.profiler.immediate as any);
  }

  private initGlobals() {
    this.addAPI(API.Base);

    if (config.enableImageEditing) this.addAPI(API.Image);
    if (config.enablePRNG) this.addAPI(API.PRNG);

    this.setGlobal("bit", luaBitLib);
    this.setGlobal("__emulatorSettings", config);
  }

  addAPI(api: Record<string, any>) {
    for (const key in api) {
      if (key[0] == "$") continue;
      if (key.startsWith("ctx$")) {
        const fn = api[key];
        const fname = key.slice(4);

        this.setGlobal(fname, (...args: any[]) => fn(this, ...args));
      } else {
        this.setGlobal(key, api[key]);
      }
    }
  }

  setGlobal(name: string, value: any) {
    if (this.definedGlobals.has(name)) throw new Error(`Global ${name} is already defined`);
    this.definedGlobals.add(name);

    if (typeof value == "function" && this.profiler && name[0] != "_") {
      const label = `${name}()`;
      this.lua.setGlobal(name, (...args: any[]) => {
        return this.profiler!.profile(label, value, ...args);
      });

      return;
    }

    this.lua.setGlobal(name, value);
  }

  execFile(file: string, once = true) {
    try {
      return once 
        ? this.dofileOnce(file)
        : this.dofile(file);
    } catch (err) {
      printError("VM", err.toString());
    }
  }

  execFileWithAPI(file: string, api: Record<string, any>) {
    try {
      for (const key in api) {
        this.setGlobal(key, api[key]);
      }

      return this.execFile(file, false);
    } finally {
      for (const key in api) {
        this.lua.setGlobal(key, null);
        this.definedGlobals.delete(key);
      }
    }
  }

  runHook(name: string, ...args: any[]) {
    const func = this.lua.getGlobal(name);
    if (typeof func != "function") return false;

    if (this.profiler) {
      this.profiler.profile(`hook:${name}()`, func, ...args);
    } else {
      func(...args);
    }

    return true;
  }
}
