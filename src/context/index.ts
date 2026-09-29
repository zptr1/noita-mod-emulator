import { LuaFunction, LuaState } from "lua-state";
import { readFileSync } from "node:fs";
import { luaBitLib } from "../lib/bit";
import { join as pjoin } from "path";
import { config } from "../config";
import * as API from "../api";

const LUA_INIT = readFileSync(pjoin(import.meta.dirname, "init.lua"), "utf8");

export class Context {
  public readonly lua = new LuaState({
    libs: ["base", "string", "table", "math", "utf8", "bit32"]
  });

  public readonly execCache = new Map<string, any>();

  public readonly dofile: LuaFunction;
  public readonly dofileOnce: LuaFunction;

  constructor(
    public readonly id: string = "?",
  ) {
    this.initGlobals();
    this.lua.eval(LUA_INIT);

    this.dofile = this.lua.getGlobal("dofile") as any;
    this.dofileOnce = this.lua.getGlobal("dofile_once") as any;

    if (typeof this.dofile != "function" || typeof this.dofileOnce != "function") {
      throw new Error("Context failed to initialize: missing dofile function(s)");
    }
  }

  private initGlobals() {
    for (const key in API) {
      if (key.startsWith("$")) continue;
      if (key.startsWith("ctx$")) {
        const fn = API[key];
        const fname = key.replace("ctx$", "");

        this.setGlobal(fname, (...args: any[]) => fn(this, ...args));
      } else {
        this.setGlobal(key, API[key]);
      }
    }

    for (const { fn, list } of API.$blankFunctions) {
      for (const fname of list) {
        this.setGlobal(fname, fn);
      }
    }

    this.setGlobal("bit", luaBitLib);
    this.setGlobal("__emulatorSettings", config);
  }

  private readonly definedGlobals = new Set<string>();
  setGlobal(name: string, value: any) {
    if (this.definedGlobals.has(name)) throw new Error(`Global ${name} is already defined`);
    this.definedGlobals.add(name);

    // TODO use this for debugging performance
    // if (typeof value == "function") {
    //   this.lua.setGlobal(name, (...args: any[]) => {
    //     console.log(name, args);
    //     return value(...args);
    //   })
    // } else {
    // }

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

    func(...args);
    return true;
  }
}
