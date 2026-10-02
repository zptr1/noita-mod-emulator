import { imageBlame, imageFiles, Img } from "../lib/img";
import { fileBlame, strFiles } from "../vfs";
import { validatePath } from "../lib/util";
import { resolve } from "node:path";
import { printLog } from "../log";

export interface FileChange {
  action: "write" | "add_append" | "set_appends" | "image";
  at: number;
  mod: string;
  path: string;
  script?: string;
}

export interface ExportedFile {
  path: string;
  virtPath: string;
  content?: string;
  image?: Img;
  blame?: string;
}

export const fileChangeLog: FileChange[] = [];

export function exportVfs(outDir: string) {
  const out: ExportedFile[] = [];
  outDir = resolve(outDir);

  printLog("VFS", "Exporting the file system...");

  for (const [ virtPath, content ] of strFiles) {
    const path = validatePath(virtPath, outDir);
    if (!path) continue;

    out.push({
      path, virtPath, content,
      blame: fileBlame.get(virtPath)
    });
  }

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

  return out;
}
