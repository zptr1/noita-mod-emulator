import { config, LogLevel } from "./config";
import cl from "chalk";

export const DEBUG_COLOR = cl.gray.bold;
export const TRACE_COLOR = cl.magenta.bold;
export const LOG_COLOR = cl.blue.bold;
export const WARN_COLOR = cl.yellow.bold;
export const ERROR_COLOR = cl.red.bold;

export let errorCount = 0;
export let warningCount = 0;

export function printDebug(thing: string, ...text: any[]) {
  if (config.logLevel > LogLevel.Debug) return;
  console.log(DEBUG_COLOR(`[${thing}]`), ...text);
}

export function printTrace(thing: string, ...text: any[]) {
  if (config.logLevel > LogLevel.Trace) return;
  console.log(TRACE_COLOR(`[${thing}]`), ...text);
}

export function printLog(thing: string, ...text: any[]) {
  if (config.logLevel > LogLevel.Info) return;
  console.log(LOG_COLOR(`[${thing}]`), ...text);
}

export function printWarn(thing: string, ...text: any[]) {
  if (config.logLevel > LogLevel.Warn) return;
  console.error(WARN_COLOR(`[${thing}]`), cl.yellowBright(...text));
  warningCount++;
}

export function printError(thing: string, ...text: any[]) {
  if (config.logLevel > LogLevel.Error) return;
  console.error(ERROR_COLOR(`[${thing}]`), cl.redBright(...text));
  errorCount++;
}

export function printErrorPlain(...text: any[]) {
  if (config.logLevel > LogLevel.Error) return;
  console.error(ERROR_COLOR(...text));
  errorCount++;
}
