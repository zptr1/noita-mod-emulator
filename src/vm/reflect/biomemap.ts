import { Img, loadImage, putImage, swap32 } from "../../lib/img";
import { MAGIC_NUMBERS, SESSION_NUMBERS } from "../../storage";
import { resolvePath } from "../../lib/util";
import { getFileBinary } from "../../vfs";
import { Context } from "../../context";
import { printLog } from "../../log";

export const biomeMap: Img = {
  width: 0, height: 0,
  buffer: new Uint32Array(0)
};

export let biomeMapFile = "";

export function loadBiomeMap() {
  const file = MAGIC_NUMBERS.get("BIOME_MAP");
  if (typeof file != "string") {
    console.error("Missing BIOME_MAP magic number");
    return;
  }

  biomeMapFile = resolvePath(file);

  if (file.endsWith(".lua")) {
    generateBiomeMap(file);
  } else {
    const img = loadImage(getFileBinary(file)!);
    if (img) {
      biomeMap.width = img.width;
      biomeMap.height = img.height;
      biomeMap.buffer = img.buffer;
    }
  }

  printLog("Reflect", `Loaded a ${biomeMap.width}x${biomeMap.height} biome map from ${biomeMapFile}`);

  SESSION_NUMBERS.set("is_biome_map_initialized", "true");
  SESSION_NUMBERS.set("BIOME_MAP", biomeMapFile);
}

export function generateBiomeMap(file: string) {
  const ctx = new Context("reflect:biome-map");

  ctx.execFileWithAPI(file, {
    BiomeMapSetSize(width: number, height: number) {
      biomeMap.width = width;
      biomeMap.height = height;
      biomeMap.buffer = new Uint32Array(width * height);
    },

    BiomeMapGetPixel(x: number, y: number) {
      if (x >= biomeMap.width || y >= biomeMap.height || x < 0 || y < 0) return 0;
      return biomeMap.buffer[y * biomeMap.width + x];
    },

    BiomeMapSetPixel(x: number, y: number, color: number) {
      if (x >= biomeMap.width || y >= biomeMap.height || x < 0 || y < 0) return;
      biomeMap.buffer[y * biomeMap.width + x] = color;
    },
    
    BiomeMapConvertPixelFromUintToInt: swap32,

    BiomeMapLoadImage(x: number, y: number, path: string) {
      putImage(
        biomeMap, loadImage(getFileBinary(path)!)!,
        x, y
      );
    },

    // TODO: Is the passed width/height meant to be the cropped region?
    // Or is it meant to be resized?
    BiomeMapLoadImageCropped(
      x: number, y: number, path: string,
      ix: number, iy: number,
      iw: number, ih: number
    ) {
      putImage(
        biomeMap, loadImage(getFileBinary(path)!)!,
        x, y, ix, iy, iw, ih
      );
    }
  });
}
