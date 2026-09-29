import { fileBlame, files, NULL, resolvePath, unreadFiles } from "./files";
import { readdirSync, readFileSync } from "node:fs";
import { printLog } from "../log";
import cl from "chalk";

export function loadDirRecursively(realDir: string, virtualDir: string, modId?: string, isMod = false, log = true) {
  if (log) {
    printLog("VFS", `Loading ${cl.green(realDir)} --> ${cl.green(virtualDir)}`);
  }

  for (const file of readdirSync(realDir, { withFileTypes: true })) {
    const virt = `${virtualDir}/${file.name}`;
    const real = `${realDir}/${file.name}`;

    if (file.isDirectory()) {
      if (file.name == "data" && isMod) {
        loadDirRecursively(real, "data", modId, false, true);
        continue;
      }

      loadDirRecursively(real, virt, modId, false, false);
    } else {
      const path = resolvePath(virt);

      files.set(path, NULL);
      unreadFiles.set(path, real);
      
      if (modId) {
        fileBlame.set(path, modId);
      }
    }
  }
}

export function loadGameData(dataDir: string) {
  loadDirRecursively(dataDir, "data");

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
  }

  printLog("VFS", "Loaded", cl.green("data.wak"), "with", fileCount, "files");
}

export function loadModData(modId: string, dir: string) {
  loadDirRecursively(dir, `mods/${modId}`, modId, true);
}
