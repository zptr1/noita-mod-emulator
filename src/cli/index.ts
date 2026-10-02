import { applyConfig, baseRun, outFileWithExt, validHook, validOutDir, validOutFilePath } from "./util";
import { ERROR_COLOR, errorCount, LOG_COLOR, TRACE_COLOR, WARN_COLOR } from "../log";
import { profiler, VERSION, config, availableMods, loadModList, run } from "..";
import { writeFileSync } from "node:fs";
import { exporter } from "./exporter";
import { program } from "commander";
import cl from "chalk";
import { runCommand } from "./commands/run";

program
  .name("noita-emu")
  .description(
    `${cl.magenta.bold("Noita Mod Emulator")} ${cl.magenta(VERSION)}\n`
    + cl.bold("Run and debug Noita mods programmatically outside of the game")
  )

  .option("-g, --game-dir <path>",
    `Must contain ${cl.yellow("data/data.wak")}\n`
    + `Detected path: ${
      config.gamePath
        ? cl.green(config.gamePath)
        : cl.red("None")
    }\n`
  )

  .option(
    "--save-vfs <dir>",
    "Dump the virtual filesystem to a directory. Will only contain files that have been accessed.",
    validOutDir
  )
  .option("--save-vfs-log <path>", "Export the log of all file changes; does not include contents (txt/log/json)", outFileWithExt("txt", "log", "json"))
  .option("--save-reflection <path>", "Export reflection data like spells, perks, status effects (yaml/json)", outFileWithExt("yml", "yaml", "json"))
  .option("--save-misc <path>", "Export mod settings, run flags, lua appends, etc (yaml/json)", outFileWithExt("yml", "yaml", "json"))
  .option("--save-biome-map <path>", "Export the generated biome map (png)", outFileWithExt("png"))
  .option("--save-locale <path>", "Export the locale file (csv/json)", outFileWithExt("csv", "json"))
  .option("--save-lua-globals <path>", "Export all lua globals (json)\n", outFileWithExt("json"))

  .option("--translate-reflection", "Resolve translation keys in the exported reflection data (--save-reflection)\n")

  .option("-p, --prof",
    "Start the profiler and save the flamegraph on exit\n"
    + "This also adds stack traces to some exports (like --save-vfs-log)"
  )
  .option("--prof-counts", "Export total call counts instead of durations")
  .option("--prof-file <path>", "Specify where to export the flamegraph to\n", validOutFilePath)

  .option("--stop-after <hook>", "Stop execution after this hook", validHook)
  .option("--unsafe-api", "Enable unsafe API (io, os, ...)\n")

  .option("--no-rng", "Disable PRNG emulation")
  .option("--no-image", "Disable image editing")
  .option("--no-locale", "Do not parse language files")
  .option("--no-biome-map", "Do not generate the biome map\n")

  .option(
    "-l, --log-level <level>",
    `0: ${cl.bold("debug")} (includes mod logs), 1: ${TRACE_COLOR("trace")}, 2: ${LOG_COLOR("info")}, 3: ${WARN_COLOR("warn")}, 4: ${ERROR_COLOR("error")}`,
    parseInt, 0
  )
  .option("-s, --seed <number>", "World seed used for PRNG", parseInt, 0)
  .helpOption("-h, --help", "Show this message")
;

program.command("run")
  .argument("[mods...]", "List of mods")
  .description("Pass a list of mod names or directories. Defaults to the current directory.")
  .action((args) => runCommand(program.opts(), args));

// program.command("repl")
//   .argument("[mods...]", "List of mods")
//   .description("Open a custom Lua REPL to control execution precisely and inspect game state")
//   .action((args) => {
//     const opts = program.opts();

//     try {
//       baseRun(opts, args, false);
//     } catch (err) {
//       program.error(err?.message || err);
//     }
//   })
// ;

program.command("mods")
  .description("Print the list of available mods")
  .action(() => {
    applyConfig(program.opts());
    loadModList();
    console.log(
      [...availableMods.values()]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((x) => cl.green(x.id))
        .join(", ")
    );
  })
;

program.parse();
