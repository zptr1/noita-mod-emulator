import { availableMods, load, loadModList, postHook, stopRunningHooks } from "../vm";
import fs, { accessSync, existsSync, readdirSync } from "node:fs";
import { config, setConfig, validateConfig } from "../config";
import { dirname, join as pjoin, resolve } from "node:path";
import { checkLuaVersion, isDir } from "../lib/util";
import { LUA_HOOKS } from "../const";
import { program } from "commander";
import { profiler } from "..";
import cl from "chalk";

function validHook(opt: string) {
  if (!LUA_HOOKS.includes(opt as any)) {
    program.error(`Invalid hook name. List of hooks (in execution order):\n${cl.yellow(LUA_HOOKS.join(", "))}`);
  }

  return opt;
};

function validOutFilePath(path: string) {
  const dir = dirname(path);
  if (existsSync(path)) program.error(`Already exists: ${dir}`);
  if (!isDir(dir)) program.error(`Not a directory: ${dir}`);
  try { accessSync(dir, fs.constants.R_OK | fs.constants.W_OK); }
  catch { program.error(`Cannot access ${dir}`); }
  return path;
};

function validOutDir(path: string) {
  if (isDir(path)) {
    if (readdirSync(path).length) program.error(`Directory not empty: ${path}`);
    try { accessSync(path, fs.constants.R_OK | fs.constants.W_OK) }
    catch { program.error(`Cannot access ${path}`) }
    return path;
  }

  return validOutFilePath(path);
}

function applyConfig(opts: any) {
  const newConfig: Partial<typeof config> = {};

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

  setConfig(newConfig);

  const error = validateConfig();
  if (error) program.error(error);
};

function baseRun(mods: string[]) {
  checkLuaVersion();

  const opts = program.opts();
  applyConfig(opts);
  loadModList(true);

  if (mods.length) {
    load(mods);
  } else {
    load([resolve(process.cwd())]);
  }

  if (opts.prof) {
    profiler.start(opts.profCounts ? "counts" : "duration");
  }

  if (opts.stopAfter) {
    postHook(opts.stopAfter, () => {
      stopRunningHooks();
    });
  }
}

program
  .name("noita-emu")
  .description("Run & debug Noita mods programmaticaly")
  .helpOption("-h, --help", "Show this message")

  .option("--game-dir <path>",
    `Must contain ${cl.yellow("data/data.wak")}\n`
    + `Detected path: ${
      config.gamePath
        ? cl.green(config.gamePath)
        : cl.red("None")
    }\n`
  )

  .option("--save-vfs <dir>", "Dump the virtual filesystem to a directory. Will only contain files that have been accessed.", validOutDir)
  .option("--save-vfs-log <path>", "Export the log of all file changes (does not include contents)", validOutFilePath)
  .option("--save-biome-map <path>", "Export the generated biome map to PNG", validOutFilePath)
  .option("--save-reflection <path>", "Export reflection data (spells, perks, status effects, etc)", validOutFilePath)
  .option("--save-misc <path>", "Export mod settings, run flags, lua appends, etc", validOutFilePath)
  .option("--save-lua-globals <path>", "Export all lua globals\n", validOutFilePath)

  .option("--prof", "Start the profiler and save the flamegraph on exit")
  .option("--prof-counts", "Export total call counts instead of durations")
  .option("--prof-file <path>", "Specify where to export the flamegraph to\n", validOutFilePath)

  .option("--stop-after <hook>", "Stop execution after this hook", validHook)
  .option("--unsafe-api", "Enable unsafe API (io, os, ...)\n")

  .option("--no-rng", "Disable PRNG emulation")
  .option("--no-image", "Disable image editing")
  .option("--no-locale", "Do not parse language files")
  .option("--no-biome-map", "Do not generate the biome map\n")

  .option("--seed <number>", "World seed used for PRNG", parseInt, 0)
;

program.command("run")
  .argument("[mods...]", "List of mods")
  .description("Pass a list of mod names or directories. Defaults to the current directory.")
  .action((args) => {
    try {
      baseRun(args);
    } catch (err) {
      console.error(err?.message || err);
    }
  });

program.command("repl")
  .argument("[mods...]", "List of mods")
  .description("Open a custom Lua REPL to control execution precisely and inspect game state")
  .action((args) => {
    try {
      baseRun(args);
    } catch (err) {
      console.error(err?.message || err);
    }
  });

program.command("mods")
  .description("Print the list of available mods")
  .action(() => {
    applyConfig(program.opts());
    loadModList();
    console.log(
      [...availableMods.values()]
        .map((x) => cl.green(x.id))
        .join(", ")
    );
  });

program.parse();
