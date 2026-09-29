import { perf, load, Reflect, run } from "./src";
import { writeFileSync } from "node:fs";

perf.start();
load(["Apotheosis", "noita.fairmod"]);
run();

Reflect.getSpells();
Reflect.getPerks();
Reflect.getStatusEffects();

perf.exportFlameGraph("graph.txt");
