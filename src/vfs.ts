import { LOCALE_PATH, RE_IMAGE_FILE, RE_TEXT_FILE } from "./const";
import { existsSync, readdirSync, readFileSync } from "fs";
import { LOCALE } from "./storage";
import { printLog } from "./log";
import { basename } from "path";
import cl from "chalk";

export const files = new Map<string, Buffer>();
export const strFiles = new Map<string, string>();
export const unreadFiles = new Map<string, string>();

export const fileBlame = new Map<string, string>();

const NULL = Buffer.alloc(0);

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

function loadDir(prefix: string, path: string, modId?: string, isMod = false, log = true) {
  if (log) {
    printLog("VFS", `Loading ${cl.yellow(path)} --> ${cl.yellow(prefix)}`);
  }

  for (const file of readdirSync(path, { withFileTypes: true })) {
    const name = `${prefix}/${file.name}`;
    const dest = `${path}/${file.name}`;

    if (file.isDirectory()) {
      if (file.name == "data" && isMod) {
        loadDir(`data`, dest, modId, false, true);
        continue;
      }

      loadDir(name, dest, modId, false, false);
    } else {
      const path = resolvePath(name);

      files.set(path, NULL);
      unreadFiles.set(path, dest);
      
      if (modId) {
        fileBlame.set(path, modId);
      }
    }
  }
}

export function loadMod(dir: string) {
  let modId = basename(dir);

  if (existsSync(`${dir}/mod_id.txt`)) {
    modId = readFileSync(`${dir}/mod_id.txt`, "utf8").trim();
  }

  loadDir(`mods/${modId}`, dir, modId, true);
  return modId;
}

export function loadGameData(dataDir: string) {
  loadDir("data", dataDir);

  const raw = readFileSync(`${dataDir}/data.wak`);
  let cursor = 0, read32le = () => raw.readUint32LE((cursor += 4) - 4);

  const _version = read32le();
  const fileCount = read32le();
  const _firstFile = read32le();
  const _padding = read32le();

  for (let i = 0; i < fileCount; i++) {
    const offset = read32le();
    const size = read32le();
    const nameLength = read32le();
    const name = raw.subarray(cursor, cursor += nameLength).toString("utf8");
    const path = resolvePath(name);
    const content = raw.subarray(offset, offset + size);

    files.set(path, content);
    // if (RE_TEXT_FILE.test(name)) {
    // } else {
    //   FS.set(path, content);
    // }
  }
}
