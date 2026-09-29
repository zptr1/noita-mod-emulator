import { LOCALE_PATH } from "../const";
import { LOCALE } from "../storage";
import { readFileSync } from "fs";

export const files = new Map<string, Buffer>();
export const strFiles = new Map<string, string>();
export const unreadFiles = new Map<string, string>();

export const fileBlame = new Map<string, string>();

export const NULL = Buffer.alloc(0);

export function resolvePath(path: string) {
  if (path[0] == "/") path = path.slice(1);

  const parts = path.split("/");
  if (parts[0] == "mods" && parts[2] == "data") {
    return parts.slice(2).join("/").toLowerCase();
  }

  return path.toLowerCase();
}

export function getFile(path: string) {
  const file = resolvePath(path);
  if (strFiles.has(file)) return strFiles.get(file);
  if (!files.has(file)) return;

  if (unreadFiles.has(file)) {
    const str = readFileSync(unreadFiles.get(file)!, "utf8");
    unreadFiles.delete(file);
    strFiles.set(file, str);
    return str;
  }

  const str = files.get(file)!.toString("utf8");
  strFiles.set(file, str);

  return str;
};

export function getFileBinary(path: string) {
  const file = resolvePath(path);
  if (strFiles.has(file)) throw new Error(`${file} has already been converted to UTF-8`);

  if (unreadFiles.has(file)) {
    files.set(file, readFileSync(unreadFiles.get(file)!));
    unreadFiles.delete(file);
  }

  return files.get(file);
}

export function setFile(path: string, content: string, blame?: string) {
  const file = resolvePath(path);

  strFiles.set(file, content);
  unreadFiles.delete(file);
  files.set(file, NULL);

  if (blame) {
    fileBlame.set(file, blame);
  }

  if (file == LOCALE_PATH) {
    LOCALE.clear();
  }
};

export const fileExists = (path: string) => files.has(resolvePath(path));
