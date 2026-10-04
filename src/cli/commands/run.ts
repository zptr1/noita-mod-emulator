import { baseRun, cliError, finish, wrapError } from "../util";
import { writeFileSync } from "node:fs";
import { exporter } from "../exporter";
import { Profiler, run } from "../..";
import cl from "chalk";

export async function runCommand(opts: any, args: any[]) {
  wrapError(
    () => baseRun(opts, args, true),
    true
  );

  try {
    run();
  } catch {
    // This should only error if the fatalErrors setting is set;
    // in which case the error is already printed.
    process.exit(1);
  }

  console.log();
  
  for (const key in exporter) {
    if (opts[key]) await exporter[key](opts[key], !!opts.translateReflection);
  }

  if (opts.prof) {
    Profiler.stop(true);

    const outFile = opts.profFile || `noita-emu-prof-${Date.now()}.txt`;
    const graph = Profiler.getFlameGraph();

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