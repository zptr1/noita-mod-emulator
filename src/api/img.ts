import { IMAGE_FILE_MAP, IMAGE_FILES, makeImageEditable } from "../img";
import { fileExists, resolvePath } from "../vfs";
import { Context } from "../context";
import { STATS } from "../storage";
import { CONFIG } from "../const";

const imageBlame = new Map<string, string>();

export function ctx$ModImageMakeEditable(ctx: Context, path: string, width: number, height: number) {
  path = resolvePath(path);
  imageBlame.set(path, ctx.id);

  if (!CONFIG.enableImageEditing) return [0, 0, 0];

  const img = makeImageEditable(path, width, height);
  if (!img) return [0, 0, 0];

  return [img.id, img.width, img.height];
}

export function ModImageIdFromFilename(path: string) {
  if (!CONFIG.enableImageEditing) return [0, 0, 0];

  const img = IMAGE_FILE_MAP.get(path);
  if (!img) return [0, 0, 0];

  return [img.id, img.width, img.height];
}

export function ModImageSetPixel(id: number, x: number, y: number, color: number) {
  if (!CONFIG.enableImageEditing) return;

  const img = IMAGE_FILES[id - 1];
  if (!img || y >= img.height || x >= img.width) return;

  STATS.setPixelCalls++;
  img.buffer[y * img.width + x] = color;
}

export function ModImageGetPixel(id: number, x: number, y: number) {
  if (!CONFIG.enableImageEditing) return 0;

  const img = IMAGE_FILES[id - 1];
  if (!img || y >= img.height || x >= img.width) return 0;

  STATS.getPixelCalls++;
  return img.buffer[y * img.width + x];
}

export function ModImageDoesExist(path: string) {
  return IMAGE_FILE_MAP.has(resolvePath(path)) || fileExists(path);
}

export function ModImageWhoSetContent(path: string) {
  return imageBlame.get(resolvePath(path));
}
