import { activeMods, gameCtx } from "./loader";
import { postHook, preHook } from "./runner";
import { loadBiomeMap } from "./reflect";
import { config } from "../config";
import * as API from "../api";

let init = false;

export function initHooks() {
  if (init) return;
  init = true;

  preHook("OnModPreInit", () => {
    API.Base.ModMagicNumbersFileAdd("data/magic_numbers.xml");
    // API.Base.ModMaterialsFileAdd("data/materials.xml");

    gameCtx.execFile("data/scripts/init.lua");
  
    for (const mod of activeMods) {
      mod.ctx.execFile(`${mod.path}/init.lua`);
    }
  });
  
  preHook("OnMagicNumbersAndWorldSeedInitialized", () => {
    API.Base.$loadMagicNumbers();
    // API.Base.$loadMaterials();
  });
  
  postHook("OnMagicNumbersAndWorldSeedInitialized", () => {
    if (config.enableBiomeMap) {
      loadBiomeMap();
    }
  });
}
