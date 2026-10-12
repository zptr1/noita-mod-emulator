import { fileBlame, files, loadAllUnreadFiles, strFiles } from "../vfs";
import { callStack, profilerEnabled } from "../context/profiler";
import { imageBlame, imageFiles, Img } from "../lib/img";
import { validatePath } from "../lib/util";
import { resolve } from "node:path";
import { printLog } from "../log";

type FileChangeAction = "write" | "add_append" | "set_appends" | "image";
interface FileChange {
  action: FileChangeAction;
  at: number;
  mod: string;
  path: string;
  script?: string;
  stackTrace?: string[];
}

interface ExportedFile {
  path: string;
  virtPath: string;
  content?: string | Buffer;
  image?: Img;
  blame?: string;
}

export const fileChangeLog: FileChange[] = [];

export function reportFileChange(action: FileChangeAction, mod: string, path: string, script?: string) {
  const log: FileChange = {
    action,
    at: Math.floor(performance.now()),
    mod, path, script,
  };

  if (profilerEnabled) {
    log.stackTrace = callStack.map((x) => x.label);
  }

  fileChangeLog.push(log);
}

export function exportVfs(outDir: string, includeUnaccessedFiles=false) {
  const out: ExportedFile[] = [];
  outDir = resolve(outDir);

  printLog("VFS", "Exporting the file system...");

  for (const [virtPath, content] of strFiles) {
    const path = validatePath(virtPath, outDir);
    if (!path) continue;

    out.push({
      path, virtPath, content,
      blame: fileBlame.get(virtPath)
    });
  }

  // TODO: see encodeAllImagesToVFS @ src/lib/img.ts
  for (const img of imageFiles) {
    if (!img.path) continue;

    const path = validatePath(img.path, outDir);
    if (!path) continue;

    out.push({
      path,
      virtPath: img.path,
      image: img,
      blame: imageBlame.get(img.path)
    });
  }

  if (includeUnaccessedFiles) {
    loadAllUnreadFiles();

    for (const [virtPath, content] of files) {
      if (!content.length) continue;

      const path = validatePath(virtPath, outDir);
      if (!path) continue;

      out.push({
        path, virtPath, content,
        blame: fileBlame.get(virtPath)
      });
    }
  }

  return out;
}
