import { profiler, load, Reflect, run, setConfig } from "./src";

profiler.start();
load(["noita.fairmod"]);
run();

Reflect.getSpells();
Reflect.getPerks();
Reflect.getStatusEffects();

profiler.exportFlameGraph("graph.txt", "duration");
