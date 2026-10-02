import { config, LogLevel } from "./config";
import cl from "chalk";

export const DEBUG_COLOR = cl.gray;
export const TRACE_COLOR = cl.bold;
export const LOG_COLOR = cl.blue.bold;
export const WARN_COLOR = cl.yellow.bold;
export const ERROR_COLOR = cl.red.bold;

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
  console.error(WARN_COLOR(`[${thing}]`), ...text);
}

export function printError(thing: string, ...text: any[]) {
  if (config.logLevel > LogLevel.Error) return;
  console.error(ERROR_COLOR(`[${thing}]`), ...text);
}
