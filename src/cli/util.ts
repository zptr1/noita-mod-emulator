import fs, { accessSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { EMULATOR_PATH, LOCALE_KEYS, LUA_HOOKS } from "../const";
import { config, setConfig, validateConfig } from "../config";
import { dirname, join as pjoin, resolve } from "node:path";
import { load, detectMods, postHook, stop } from "../vm";
import { checkLuaVersion, isDir } from "../lib/util";
import { PLACEHOLDER_FUNCS } from "../context/lua";
import { errorCount, warningCount } from "../log";
import { Profiler, API, storage } from "..";
import { program } from "commander";
import cl from "chalk";

// Might add a way to save/load config later? to avoid having to pass these arguments all the time
// probably a `noita-emu.json` file or smth
const newConfig: Partial<typeof config> = {};

export const PERMANENT_GAME_PATH = pjoin(EMULATOR_PATH, ".game-path.txt");
if (existsSync(PERMANENT_GAME_PATH)) {
  try {
    config.gamePath = readFileSync(PERMANENT_GAME_PATH, "utf8").trim();
  } catch {}
}

export function validHook(opt: string) {
  if (!LUA_HOOKS.includes(opt as any)) {
    cliError(`Invalid hook name. List of hooks (in execution order):\n${cl.yellow(LUA_HOOKS.join(", "))}`);
  }

  return opt;
};

export function validOutFilePath(path: string) {
  const dir = dirname(path);
  if (!isDir(dir)) cliError(`Not a directory: ${dir}`);
  try { accessSync(dir, fs.constants.R_OK | fs.constants.W_OK); }
  catch { cliError(`Cannot access ${dir}`); }
  return path;
};

export function validJSON(value: string) {
  try {
    const json = JSON.parse(value);
    if (typeof json != "object" || Array.isArray(json)) {
      cliError(`Expected a JSON object`);
    }

    return json;
  } catch (e) {
    cliError(`Error parsing JSON: ${e}`);
  }
}

export function outFileWithExt(...exts: string[]) {
  return (path: string) => {
    const dots = path.split(".");
    if (dots.length < 2 || !exts.includes(dots.at(-1)!)) {
      cliError(
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
    if (readdirSync(path).length) cliError(`Cowardly refusing to write to a non-empty directory: ${path}`);
    try { accessSync(path, fs.constants.R_OK | fs.constants.W_OK) }
    catch { cliError(`Cannot access ${path}`) }
    return path;
  }

  return validOutFilePath(path);
}

export function validLocale(locale: any) {
  if (!LOCALE_KEYS.includes(locale)) {
    cliError(`Invalid locale: ${locale}. Allowed locales: ${LOCALE_KEYS.join(", ")}`);
  }

  return locale;
}

export function applyConfig(opts: any) {
  if (opts.gameDir) setGameDir(opts.gameDir, false);

  if (opts.fatalErrors) newConfig.fatalErrors = true;
  if (opts.unsafeApi) newConfig.luaUnsafeLibs = true;
  if (opts.seed != config.worldSeed) newConfig.worldSeed = opts.seed;
  if (opts.logLevel != config.logLevel) newConfig.logLevel = opts.logLevel;
  if (opts.locale) newConfig.language = opts.locale;

  if (!opts.rng) newConfig.enablePRNG = false;
  if (!opts.image) newConfig.enableImageEditing = false;
  if (!opts.locale) newConfig.enableLocalization = false;
  if (!opts.biomeMap) newConfig.enableBiomeMap = false;

  if (opts.saveVfsLog) newConfig.collectFileLog = true;

  if (opts.settings) {
    for (const key in opts.settings) {
      const value = opts.settings[key];

      if (value === undefined || value === null) {
        continue;
      }

      if (typeof value == "object") {
        cliError(`Invalid setting ${key}: cannot pass an object`);
      }

      storage.SETTINGS.set(key, [value, null]);
    }
  }

  setConfig(newConfig);

  const error = validateConfig();
  if (error) cliError(error);
};

export function setGameDir(dir: string, applyImmediately = true) {
  const conf = applyImmediately ? config : newConfig;
  const abs = resolve(dir);

  conf.gamePath = abs;
  conf.workshopPath = pjoin(abs, "../../workshop/content/881100/");
}

export function baseRun(opts: any, mods: string[], defaultCurrentDir: boolean) {
  checkLuaVersion();

  applyConfig(opts);
  detectMods(true);

  if (opts.prof) {
    Profiler.start(opts.profCounts ? "counts" : "duration");
  }

  if (!mods.length && defaultCurrentDir) {
    const dir = resolve(process.cwd());
    if (existsSync(pjoin(dir, "mod.xml"))) {
      mods.push(dir);
    }
  }

  load(mods);

  if (opts.stopAfter) {
    postHook(opts.stopAfter, () => {
      stop();
    });
  }
}

export function getAllAPIs() {
  const apis = new Set(PLACEHOLDER_FUNCS);

  for (const key in API) {
    const funcs = API[key];
    if (typeof funcs != "object") continue;

    for (const fname in funcs) {
      if (fname[0] == "$") continue;
      if (fname.startsWith("ctx$")) apis.add(fname.slice(4));
      else apis.add(fname);
    }
  }

  return apis;
}

export function finish() {
  console.log();
  console.log(
    `Execution finished with`,
    errorCount ? cl.redBright(errorCount) : cl.green(0),
    `error${errorCount == 1 ? "" : "s"} and`,
    warningCount ? cl.yellowBright(warningCount) : cl.green(0),
    `warning${warningCount == 1 ? "" : "s"}`
  );

  if (errorCount) {
    process.exit(1);
  }
}

export function cliError(...msg: string[]) {
  program.error(cl.redBright(...msg));
}
