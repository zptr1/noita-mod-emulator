import { Profiler, load, Reflect, run, detectMods } from "../src";

Profiler.start();

detectMods();
load(["noita.fairmod"]);
run();

Reflect.getSpells();
Reflect.getPerks();
Reflect.getStatusEffects();

Profiler.stop();
