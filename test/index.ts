import { profiler, load, Reflect, run } from "../src";

profiler.start();

load(["noita.fairmod"]);
run();

Reflect.getSpells();
Reflect.getPerks();
Reflect.getStatusEffects();

profiler.stop();
