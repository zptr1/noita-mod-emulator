import fs, { accessSync, existsSync, readdirSync } from "node:fs";
import { dirname, join as pjoin, resolve } from "node:path";
import { LUA_HOOKS } from "../const";
import { program } from "commander";
import { checkLuaVersion, isDir } from "../lib/util";
import { config, setConfig, validateConfig } from "../config";
import cl from "chalk";
import { load, loadModList, postHook, stopRunningHooks } from "../vm";
import { profiler } from "..";

// Might add a way to save/load config later? to avoid having to pass these arguments all the time
// probably a `noita-emu.json` file or smth
const newConfig: Partial<typeof config> = {};

export function validHook(opt: string) {
  if (!LUA_HOOKS.includes(opt as any)) {
    program.error(`Invalid hook name. List of hooks (in execution order):\n${cl.yellow(LUA_HOOKS.join(", "))}`);
  }

  return opt;
};

export function validOutFilePath(path: string) {
  const dir = dirname(path);
  if (existsSync(path)) program.error(`Already exists: ${dir}`);
  if (!isDir(dir)) program.error(`Not a directory: ${dir}`);
  try { accessSync(dir, fs.constants.R_OK | fs.constants.W_OK); }
  catch { program.error(`Cannot access ${dir}`); }
  return path;
};

export function outFileWithExt(...exts: string[]) {
  return (path: string) => {
    const dots = path.split(".");
    if (dots.length < 2 && !exts.includes(dots.at(-1)!)) {
      program.error(
        `Not a valid file extension: ${path}\nAllowed extensions: ${
          exts.map((x) => `.${x}`).join("/")
        }`
      );
    }

    return validOutFilePath(path);
  };
}

export function validOutDir(path: string) {
  if (isDir(path)) {
    if (readdirSync(path).length) program.error(`Directory not empty: ${path}`);
    try { accessSync(path, fs.constants.R_OK | fs.constants.W_OK) }
    catch { program.error(`Cannot access ${path}`) }
    return path;
  }

  return validOutFilePath(path);
}

export function applyConfig(opts: any) {
  if (opts.gameDir) {
    newConfig.gamePath = opts.gameDir;
    newConfig.workshopPath = pjoin(opts.gameDir, "../../workshop/content/881100/");
  }

  if (opts.unsafeApi) newConfig.luaUnsafeLibs = true;
  if (opts.seed != config.worldSeed) newConfig.worldSeed = opts.seed;

  if (!opts.rng) newConfig.enablePRNG = false;
  if (!opts.image) newConfig.enableImageEditing = false;
  if (!opts.locale) newConfig.enableLocalization = false;
  if (!opts.biomeMap) newConfig.enableBiomeMap = false;

  if (opts.saveVfsLog) newConfig.collectFileLog = true;
  
  setConfig(newConfig);

  const error = validateConfig();
  if (error) program.error(error);
};

export function baseRun(opts: any, mods: string[], defaultCurrentDir: boolean) {
  checkLuaVersion();

  applyConfig(opts);
  loadModList(true);

  if (!mods.length && defaultCurrentDir) {
    mods.push(resolve(process.cwd()));
  }

  load(mods);

  if (opts.prof) {
    profiler.start(opts.profCounts ? "counts" : "duration");
  }

  if (opts.stopAfter) {
    postHook(opts.stopAfter, () => {
      stopRunningHooks();
    });
  }
}
