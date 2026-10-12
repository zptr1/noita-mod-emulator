import { printWarn } from "../log";
import { files, getFileBinary, strFiles } from "../vfs";
import { resolvePath } from "./util";
import { PNG } from "pngjs";
import sharp from "sharp";

export interface Img {
  id?: number;
  path?: string;
  width: number;
  height: number;
  buffer: Uint32Array;
}

export const imageFileMap = new Map<string, Img>();
export const imageFiles: Img[] = [];

export const imageBlame = new Map<string, string>();

export function loadImage(buffer: Buffer, path?: string): Img | undefined {
  if (!Buffer.isBuffer(buffer)) return;

  try {
    const png = PNG.sync.read(buffer);
    const view = new Uint32Array(
      png.data.buffer, png.data.byteOffset,
      png.data.byteLength / 4
    );

    return {
      width: png.width,
      height: png.height,
      buffer: view
    };
  } catch (err) {
    printWarn("API", `Error loading image from ${path || "[Buffer]"}: ${err.stack || err}`);
    return;
  }
}

export function makeImageEditable(path: string, width: number, height: number) {
  path = resolvePath(path);

  if (imageFileMap.has(path)) {
    return imageFileMap.get(path);
  }

  const file = getFileBinary(path);
  const id = imageFiles.length + 1;
  let buffer: Uint32Array;

  if (Buffer.isBuffer(file)) {
    const img = loadImage(file, path);
    if (!img) return;

    width = img.width;
    height = img.height;
    buffer = img.buffer;
  } else {
    buffer = new Uint32Array(width * height);
  }

  const img: Img = {
    id, width, height, path, buffer
  };

  imageFileMap.set(path, img);
  imageFiles.push(img);

  return img;
}

export async function encodeImageToPNG(img: Img) {
  const { width, height, buffer } = img;
  const raw = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  return await sharp(raw, {
    raw: {
      width, height,
      channels: 4
    }
  }).png().toBuffer();
}

// TODO: I was considering changing Reflect.exportVfs to make it cleaner (and more similar to exporting .wak)
// But I kinda realized that will make it harder to avoid exported unaccessed files
// Should it *always* export all files, even if unaccessed?
export async function encodeAllImagesToVFS() {
  for (const img of imageFiles) {
    if (!img.path) continue;
    if (strFiles.has(img.path)) strFiles.delete(img.path);
    
    files.set(img.path, await encodeImageToPNG(img));
  }
}

export function putImage(
  dest: Img, src: Img,
  destX: number, destY: number,
  cropX = 0, cropY = 0,
  cropW = src.width, cropH = src.height
) {
  cropX = Math.min(Math.max(cropX, 0), src.width - 1);
  cropY = Math.min(Math.max(cropY, 0), src.height - 1);
  cropW = Math.min(Math.max(cropW, 0), src.width - cropX, dest.width - destX);
  cropH = Math.min(Math.max(cropH, 0), src.height - cropY, dest.height - destY);

  for (let y = 0; y < cropH; y++) {
    const destOffset = (destY + y) * dest.width + destX;
    const srcOffset = (cropY + y) * src.width + cropX;

    for (let x = 0; x < cropW; x++) {
      dest.buffer[destOffset + x] = src.buffer[srcOffset + x];
    }
  }
}

// AABBGGRR <-> AARRGGBB
export function swap32(color: number) {
  return (
    (color >> 24) & 0xFF
    | (color >> 16) & 0xFF
    | (color >> 8) & 0xFF
    | (color) & 0xFF
  );
}
