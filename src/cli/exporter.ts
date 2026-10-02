import { mkdirSync, writeFileSync } from "node:fs";
import { activeMods, gameCtx, Reflect } from "..";
import { encodeImageToPNG } from "../lib/img";
import { getAllAPIs } from "./util";
import { dirname, join as pjoin, resolve } from "node:path";
import { printErrorPlain, printWarn } from "../log";
import cl from "chalk";
import { translateReflection } from "../reflect/misc";

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

    console.log(cl.bold(`Exported ${files.length} files to ${outDir}`));
  },
  saveVfsLog(path: string) {
    const log = Reflect.fileChangeLog;

    if (path.endsWith(".json")) {
      writeFileSync(path, JSON.stringify(log, null, 2));
    } else {
      const fmt = log.map(
        (x) => `[${
          x.at.toString().padStart(6, " ")
        }ms] [${x.mod}] ${x.action.toUpperCase()} ${x.path}${
          x.script ? " -> " + x.script : ""
        }${
          x.stackTrace ? "\n         @ " + x.stackTrace.join(" -> ") : ""
        }`
      ).join("\n");

      writeFileSync(path, fmt);
    }

    console.log(cl.bold(`Saved file change log to ${path} (${log.length} entries)`));
  },
  saveReflection(path: string, translate: boolean) {
    const f = <T>(x: T, type: string) => translate ? translateReflection(x as any, type) : x;

    const data = {
      spells: f(Reflect.getSpells(), "Spell"),
      perks: f(Reflect.getPerks(), "Perk"),
      statusEffects: f(Reflect.getStatusEffects(), "Status effect"),
    };

    writeFileSync(path, JSON.stringify(data, null, 2));

    console.log(cl.bold(`Saved reflection data to ${path}`));
  },
  saveMisc(path: string) {
    
  },
  async saveBiomeMap(path: string) {
    if (!Reflect.biomeMapFile) Reflect.loadBiomeMap();

    const map = Reflect.biomeMap;
    if (!map.width || !map.height) {
      printErrorPlain(`Could not generate the biome map properly`);
      return;
    }

    const img = await encodeImageToPNG(map);
    writeFileSync(path, img);

    console.log(cl.bold(`Saved a ${map.width}x${map.height} biome map to ${path}`));
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
