import { GameTextGetTranslatedOrNot } from "./data/locale";
import { biomeMap } from "../vm/reflect/biomemap";
import { activeModsById, activeMods } from "../vm/loader";
import { Context } from "../context";
import { printDebug } from "../log";
import { EMULATOR } from "../const";
import cl from "chalk";

export const ModGetAPIVersion = () => 6942;

export function ModIsEnabled(id: string) {
  if (id == EMULATOR) return true;
  return activeModsById.has(id);
}

export function ModGetActiveModIDs() {
  return activeMods.map((x) => x.id);
}

export function print_error(...text: string[]) {
  console.error(...text);
}

export function GameGetDateAndTimeUTC() {
  const date = new Date();
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()];
}

export function GameGetDateAndTimeLocal() {
  const date = new Date();
  return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), false];
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

export function ctx$print(ctx: Context, ...text: string[]) {
  printDebug(`print (${ctx.id})`, ...text);
}

export function ctx$GamePrint(ctx: Context, log: string) {
  printDebug(`GamePrint (${ctx.id})`, cl.green(GameTextGetTranslatedOrNot(log)));
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
