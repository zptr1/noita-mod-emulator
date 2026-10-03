import { baseRun, cliError, finish } from "../util";
import { writeFileSync } from "node:fs";
import { exporter } from "../exporter";
import { profiler, run } from "../..";
import cl from "chalk";

export async function runCommand(opts: any, args: any[]) {
  try {
    baseRun(opts, args, true);
  } catch (err) {
    cliError(err?.message || err);
  }

  try {
    run();
  } catch {
    process.exit(1);
  }

  console.log();
  
  for (const key in exporter) {
    if (opts[key]) await exporter[key](opts[key], !!opts.translateReflection);
  }

  if (opts.prof) {
    profiler.stop(true);

    const outFile = opts.profFile || `noita-emu-prof-${Date.now()}.txt`;
    const graph = profiler.getFlameGraph();

    writeFileSync(outFile, graph);

    console.log(cl.bold(`Exported flame graph to ${cl.green(outFile)}`));
    console.log(
      "Use", cl.blue("https://speedscope.app/"),
      `to view it (numbers are ${cl.bold(
        opts.profCounts
          ? "call counts"
          : "milliseconds"
      )})`
    );
  }

  finish();
}