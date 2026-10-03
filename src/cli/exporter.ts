import { printError, printErrorPlain, printWarn } from "../log";
import { activeMods, GAME_FLAGS, gameCtx, GLOBALS, LUA_APPENDS, MAGIC_NUMBERS, PERSISTENT_FLAGS, Reflect, SESSION_NUMBERS, SETTINGS, VERSION } from "..";
import { mkdirSync, writeFileSync } from "node:fs";
import { encodeImageToPNG } from "../lib/img";
import { getAllAPIs } from "./util";
import { dirname } from "node:path";
import * as YAML from "js-yaml";
import cl from "chalk";
import { mapToObject } from "../lib/util";

function exportJSON(path: string, obj: any) {
  if (path.endsWith(".json")) {
    writeFileSync(path, JSON.stringify(obj, null, 2));
  } else if (path.endsWith(".yaml")) {
    writeFileSync(
      path,
      `# Generated with Noita Mod Emulator ${VERSION}\n`
      + `# Mods: ${activeMods.map((x) => x.id).join(", ")}\n\n`
      + YAML.dump(obj)
    );
  } else {
    printError(`Unsupported format: ${path}`);
  }
}

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

    console.log(cl.bold(`Exported ${files.length} files to ${cl.green(outDir)}`));
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

    console.log(cl.bold(`Saved file change log to ${cl.green(path)} (${log.length} entries)`));
  },
  saveReflection(path: string, translate: boolean) {
    const f = <T>(x: T, type: string) => translate ? Reflect.translateReflection(x as any, type) : x;

    const data = {
      spells: f(Reflect.getSpells(), "Spell"),
      perks: f(Reflect.getPerks(), "Perk"),
      statusEffects: f(Reflect.getStatusEffects(), "Status effect"),
    };

    exportJSON(path, data);
    console.log(cl.bold(`Saved reflection data to ${cl.green(path)}`));
  },
  saveMisc(path: string) {
    const misc = {
      settings: mapToObject(
        SETTINGS, 
        (x) => x[1] != undefined ? ({
          value: x[0],
          next: x[1]
        }) : x[0]
      ),
      persistentFlags: [...PERSISTENT_FLAGS.values()],
      gameFlags: [...GAME_FLAGS.values()],
      globals: mapToObject(GLOBALS),
      magicNumbers: mapToObject(MAGIC_NUMBERS),
      sessionNumbers: mapToObject(SESSION_NUMBERS),
      appends: mapToObject(LUA_APPENDS, (v) => [...v.values()])
    };

    exportJSON(path, misc);
    console.log(cl.bold(`Saved misc data to ${cl.green(path)}`));
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

    console.log(cl.bold(`Saved a ${map.width}x${map.height} biome map to ${cl.green(path)}`));
  },
  saveLocale(path: string) {
    const { raw, locale } = Reflect.loadLocale();
    
    if (path.endsWith(".csv")) {
      const csv = raw
        .filter((x, i) => !!x[0] || i == 0)
        .map((x) => x.join(","))
        .join("\n");

      writeFileSync(path, csv);
    } else {
      exportJSON(path, locale);
    }
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

    exportJSON(path, out);
    console.log(cl.bold(`Saved all Lua globals to ${cl.green(path)}`));
  },
};
