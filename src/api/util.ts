import { GameTextGetTranslatedOrNot } from "./data/locale";
import { activeModsById, activeMods } from "../vm/loader";
import { biomeMap } from "../vm/reflect/biomemap";
import { printDebug, printError } from "../log";
import { Context } from "../context";
import { EMULATOR } from "../const";
import { config } from "../config";
import cl from "chalk";

export const ModGetAPIVersion = () => 6942;

export function ModIsEnabled(id: string) {
  if (id == EMULATOR) return true;
  return activeModsById.has(id);
}

export function ModGetActiveModIDs() {
  return activeMods.map((x) => x.id);
}

export function ctx$print_error(ctx: Context, ...text: string[]) {
  printError(ctx.id, ...text);
}

export function GameGetDateAndTimeUTC() {
  const date = new Date();
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()];
}

export function GameGetDateAndTimeLocal() {
  const date = new Date();
  return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
}

export const BiomeMapGetSize = () => [biomeMap.width, biomeMap.height];
export function GetParallelWorldPosition(x: number, y: number) {
  return [Math.floor(x / 512 / biomeMap.width), Math.floor(y / 512 / biomeMap.height)];
}

export function GameGetFrameNum() {
  // idk??? why not lol
  return Math.floor(performance.now() / (1000 / 60));
}

export function GameGetRealWorldTimeSinceStarted() {
  return performance.now() / 1000;
}

export function SetWorldSeed(seed: number) {
  config.worldSeed = seed;
  printDebug("API", "Seed changed to", seed);
}

export function ctx$print(ctx: Context, ...text: string[]) {
  printDebug(`print (${ctx.id})`, ...text);
}

export function ctx$GamePrint(ctx: Context, log: string) {
  printDebug(`GamePrint (${ctx.id})`, cl.green(GameTextGetTranslatedOrNot(log)));
}

export function ctx$DEBUG_MARK(
  ctx: Context,
  x: number, y: number, message: string,
  r: number, g: number, b: number
) {
  const color = cl.rgb(Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255));
  printDebug(`DEBUG_MARK (${ctx.id}) @ ${x}, ${y}`, color(message));
}

export function ctx$GamePrintImportant(ctx: Context, title: string, description: string) {
  printDebug(
    `GamePrintImportant (${ctx.id})`,
    cl.bold.yellow(GameTextGetTranslatedOrNot(title))
  );

  if (description) {
    console.log(">>>", cl.yellow(GameTextGetTranslatedOrNot(description)));
  }
}
