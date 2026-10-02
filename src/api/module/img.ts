import { IMAGE_FILE_MAP, IMAGE_FILES, makeImageEditable } from "../../lib/img";
import { fileChangeLog } from "../../reflect";
import { resolvePath } from "../../lib/util";
import { Context } from "../../context";
import { fileExists } from "../../vfs";
import { printDebug } from "../../log";
import { config } from "../../config";

const imageBlame = new Map<string, string>();
let pixelAPICount = 0;

export function ctx$ModImageMakeEditable(ctx: Context, path: string, width: number, height: number) {
  path = resolvePath(path);
  imageBlame.set(path, ctx.id);

  const img = makeImageEditable(path, width, height);
  if (!img) return [0, 0, 0];

  if (config.collectFileLog) {
    fileChangeLog.push({ action: "image", at: performance.now(), mod: ctx.id, path });
  }

  return [img.id, img.width, img.height];
}

export function ModImageIdFromFilename(path: string) {
  const img = IMAGE_FILE_MAP.get(path);
  if (!img) return [0, 0, 0];

  return [img.id, img.width, img.height];
}

export function ModImageSetPixel(id: number, x: number, y: number, color: number) {
  const img = IMAGE_FILES[id - 1];
  if (!img || x >= img.width || y >= img.height || x < 0 || y < 0) return;

  if (++pixelAPICount == 400_000) {
    printDebug("API", "Doing a lot of image editing bullshit");
  }

  img.buffer[y * img.width + x] = color;
}

export function ModImageGetPixel(id: number, x: number, y: number) {
  const img = IMAGE_FILES[id - 1];
  if (!img || x >= img.width || y >= img.height || x < 0 || y < 0) return 0;

  if (++pixelAPICount == 400_000) {
    printDebug("API", "Doing a lot of image editing bullshit");
  }

  return img.buffer[y * img.width + x];
}

export function ModImageDoesExist(path: string) {
  return IMAGE_FILE_MAP.has(resolvePath(path)) || fileExists(path);
}

export function ModImageWhoSetContent(path: string) {
  return imageBlame.get(resolvePath(path));
}
