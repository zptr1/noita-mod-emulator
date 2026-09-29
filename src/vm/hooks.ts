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
    API.ModMagicNumbersFileAdd("data/magic_numbers.xml");
    gameCtx.execFile("data/scripts/init.lua");
  
    for (const mod of activeMods) {
      mod.ctx.execFile(`${mod.path}/init.lua`);
    }
  });
  
  preHook("OnMagicNumbersAndWorldSeedInitialized", () => {
    API.$loadMagicNumbers();
  });
  
  postHook("OnMagicNumbersAndWorldSeedInitialized", () => {
    // TODO: does this run before or after this hook? or somewhere else entirely?
    if (config.enableBiomeMap) {
      loadBiomeMap();
    }
  });
}
