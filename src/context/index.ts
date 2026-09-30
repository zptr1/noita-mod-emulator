import { createProfiler, Profiler, profilerEnabled } from "./profiler";
import { getLuaPlaceholder } from "./placeholders";
import { LuaFunction, LuaState } from "lua-state";
import { getLuaScript } from "../lib/util";
import { luaBitLib } from "../lib/bit";
import { config } from "../config";
import * as API from "../api";

const LUA_INIT = getLuaScript("init-ctx.lua");
const LUA_INIT_PERF = getLuaScript("init-perf.lua");

export class Context {
  public readonly lua = new LuaState({ libs: config.luaLibs });

  private readonly definedGlobals = new Set<string>();
  private profiler?: Profiler;

  public readonly dofile: LuaFunction;
  public readonly dofileOnce: LuaFunction;

  constructor(
    public readonly id: string = "?",
  ) {
    this.lua.eval(getLuaPlaceholder());
    this.lua.eval(LUA_INIT);
    this.initProfiler();

    this.dofile = this.lua.getGlobal("dofile") as any;
    this.dofileOnce = this.lua.getGlobal("dofile_once") as any;

    if (typeof this.dofile != "function" || typeof this.dofileOnce != "function") {
      throw new Error("Context failed to initialize: missing dofile function(s)");
    }

    this.initGlobals();
  }

  private initProfiler() {
    if (!profilerEnabled) return;

    this.profiler = createProfiler(this);
    this.lua.eval(LUA_INIT_PERF);
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
      console.error(err.toString());
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
