import { fileBlame, files, NULL, realFilePath, unreadFiles } from "./files";
import { readdirSync, readFileSync } from "node:fs";
import { loadDataWak } from "../lib/nolla_data";
import { printLog, printTrace } from "../log";
import { resolvePath } from "../lib/util";
import { config } from "../config";
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
      realFilePath.set(path, real);
      unreadFiles.add(path);

      if (modId) {
        fileBlame.set(path, modId);
      }
    }
  }
}

export function loadGameData(dataDir: string) {
  if (!config.dataWakOnly) {
    loadDirRecursively(dataDir, "data");
  }

  const raw = readFileSync(`${dataDir}/data.wak`);
  const fileCount = loadDataWak(raw, files);

  printTrace("VFS", "Loaded", cl.green("data.wak"), "with", fileCount, "files");
}

export function loadModData(modId: string, dir: string) {
  loadDirRecursively(dir, `mods/${modId}`, modId, true);
}
