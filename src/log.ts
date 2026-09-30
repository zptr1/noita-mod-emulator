import cl from "chalk";

export function printLog(thing: string, ...text: any[]) {
  console.log(cl.blue(`[${thing}]`), ...text);
}

export function printError(thing: string, ...text: any[]) {
  console.log(cl.red(`[${thing}]`), ...text);
}

export function printWarn(thing: string, ...text: any[]) {
  console.log(cl.yellow(`[${thing}]`), ...text);
}

export function printDebug(thing: string, ...text: any[]) {
  console.log(cl.gray(`[${thing}]`), ...text);
}
