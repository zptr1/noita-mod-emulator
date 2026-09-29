import { NollaPrng } from "../lib/nolla_prng";
import { printDebug } from "../log";
import { CONFIG } from "../const";

let worldSeed = CONFIG.worldSeed;
let prng = new NollaPrng();
let proceduralPrng = new NollaPrng();

export function SetWorldSeed(seed: number) {
  worldSeed = seed;
  printDebug("API", "Seed changed to", worldSeed);
}

export function SetRandomSeed(x: number, y: number) {
  prng.SetRandomSeed(worldSeed, x, y);
}

const scale = (val: number, a?: number, b?: number) => {
  if (typeof a != "number") return val;
  if (typeof b != "number") return val * (a + 1);
  return val * (b + 1 - a) + a;
}

export function Random(a?: number, b?: number): number {
  if (typeof a != "number" && typeof b != "number") return Randomf();
  return Math.floor(Randomf(a, b));
}

export function Randomf(a?: number, b?: number): number {
  return scale(prng.Next(), a, b);
}

export function RandomDistribution(min: number, max: number, mean: number, sharpness = 1, baseline = 0.005): number {
  return prng.RandomDistribution(min, max, mean, sharpness, baseline);
}

export function RandomDistributionf(min: number, max: number, mean: number, sharpness = 1, baseline = 0.005): number {
  return prng.RandomDistributionF(min, max, mean, sharpness, baseline);
}

export function ProceduralRandom(x: number, y: number, a?: number, b?: number): number {
  if (typeof a != "number" && typeof b != "number") return ProceduralRandomf(x, y);
  return Math.floor(ProceduralRandomf(x, y, a, b));
}

export function ProceduralRandomf(x: number, y: number, a?: number, b?: number): number {
  proceduralPrng.SetRandomSeed(worldSeed, x, y);
  return scale(proceduralPrng.Next(), a, b);
}

export function ProceduralRandomi(x: number, y: number, a?: number, b?: number): number {
  return Math.floor(ProceduralRandomf(x, y, a, b));
}
