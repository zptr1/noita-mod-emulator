import { mkdirSync, writeFileSync } from "node:fs";
import { encodeImageToPNG } from "../lib/img";
import { activeMods, gameCtx, Reflect } from "..";
import { dirname } from "node:path";
import { printWarn } from "../log";
import cl from "chalk";
import { getAllAPIs } from "./util";

function formatLuaObject(obj: any, omit?: Set<string>, visited = new Set<any>(), out: any = {}) {
  if (visited.has(obj)) return "<circular object>";
  visited.add(obj);

  const functions: string[] = [];

  for (const key in obj) {
    const val = obj[key];
    
    if (omit && omit.has(key)) continue;

    if (typeof val == "function") {
      functions.push(key);
      continue;
    }
    
    if (Array.isArray(val)) {
      // TODO: apparently lua-state doesn't quite return these as arrays, so this never gets triggered
      out[key] = val.map((x) => formatLuaObject(x, undefined, visited));
    } else if (typeof val == "object") {
      out[key] = formatLuaObject(val, undefined, visited);
    } else {
      out[key] = val;
    }
  }

  if (functions.length) {
    // This can still be used programmatically (by splitting by comma)
    // and improves readability for JSON.stringify
    out["$funcs"] = functions.join(",");
  }

  return out;
}

export const exporter = {
  async saveVfs(outDir: string) {
    mkdirSync(outDir, { recursive: true });

    const files = Reflect.exportVfs(outDir);
    
    const createdDirs = new Set<string>();
    const savedFiles = new Set<string>();

    for (const file of files) {
      if (savedFiles.has(file.path)) {
        printWarn("VFS", `Duplicated file path: ${file.path} (from ${file.blame || "?"})`);
        continue;
      }
      
      const dir = dirname(file.path);
      if (!createdDirs.has(dir)) {
        mkdirSync(dir, { recursive: true });
        createdDirs.add(dir);
      }

      savedFiles.add(file.path);

      // wx guarantees this will never override an existing file
      if (file.content) {
        writeFileSync(file.path, file.content, { flag: "wx" });
      } else if (file.image) {
        const buffer = await encodeImageToPNG(file.image);
        writeFileSync(file.path, buffer, { flag: "wx" });
      }
    }

    console.log(cl.bold(`Exporting ${files.length} files to ${outDir}`));
  },
  saveVfsLog(path: string) {
    
  },
  saveReflection(path: string, translate: boolean) {
    const spells = Reflect.getSpells();
    const perks = Reflect.getPerks();
    const statusEffects = Reflect.getStatusEffects();

    console.log(cl.bold(`Saved reflection data to ${path}`))
  },
  saveMisc(path: string) {
    
  },
  async saveBiomeMap(path: string) {
    if (!Reflect.biomeMapFile) Reflect.loadBiomeMap();
    
    const img = await encodeImageToPNG(Reflect.biomeMap);
    writeFileSync(path, img);
  },
  saveLocale(path: string) {
    
  },
  saveLuaGlobals(path: string) {
    const omit = getAllAPIs();
    omit.add("_G");

    const out = {};

    const vanillaGlobals = gameCtx.lua.eval("return _G");
    out["$vanilla"] = formatLuaObject(vanillaGlobals, omit);

    for (const mod of activeMods) {
      const glob = mod.ctx.lua.eval("return _G");
      out[mod.id] = formatLuaObject(glob, omit);
    }

    writeFileSync(path, JSON.stringify(out, null, 2));
  },
};
