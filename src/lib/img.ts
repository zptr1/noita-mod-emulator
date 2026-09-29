import { getFileBinary } from "../vfs";
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

export const IMAGE_FILE_MAP = new Map<string, Img>();
export const IMAGE_FILES: Img[] = [];

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
    console.warn(`Error loading image ${path || "[Buffer]"}`);
    console.warn(err);
    return;
  }
}

export function makeImageEditable(path: string, width: number, height: number) {
  path = resolvePath(path);

  if (IMAGE_FILE_MAP.has(path)) {
    return IMAGE_FILE_MAP.get(path);
  }

  const file = getFileBinary(path);
  const id = IMAGE_FILES.length + 1;
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

  IMAGE_FILE_MAP.set(path, img);
  IMAGE_FILES.push(img);

  return img;
}

export async function saveImageToDisk(realPath: string, img: Img) {
  const { width, height, buffer } = img;
  const raw = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  await sharp(raw, {
    raw: {
      width, height,
      channels: 4
    }
  }).png().toFile(realPath);
}

export function putImage(
  dest: Img, src: Img,
  destX: number, destY: number,
  cropX = 0, cropY = 0,
  cropW = src.width, cropH = src.height
) {
  cropX = Math.max(cropX, 0);
  cropY = Math.max(cropY, 0);
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
