import { perf, load, Reflect, run, setConfig } from "./src";
import { writeFileSync } from "node:fs";

perf.start();
load(["noita.fairmod"]);
run();

Reflect.getSpells();
Reflect.getPerks();
Reflect.getStatusEffects();

writeFileSync(
  "graph.folded",
  perf.exportFlameGraph()
);
