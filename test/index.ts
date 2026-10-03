import { profiler, load, Reflect, run, detectMods } from "../src";

profiler.start();

detectMods();
load(["noita.fairmod"]);
run();

Reflect.getSpells();
Reflect.getPerks();
Reflect.getStatusEffects();

profiler.stop();
