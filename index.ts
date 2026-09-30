import { profiler, load, Reflect, run } from "./src";

profiler.start();
load(["Apotheosis"]);
run();

Reflect.getSpells();
Reflect.getPerks();
Reflect.getStatusEffects();

profiler.exportFlameGraph("graph.txt", "count");
