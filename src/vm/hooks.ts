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
    gameCtx.execFile("data/scripts/init.lua");
  
    for (const mod of activeMods) {
      mod.ctx.execFile(`${mod.path}/init.lua`);
    }
  });
  
  preHook("OnMagicNumbersAndWorldSeedInitialized", () => {
    API.Base.$loadMagicNumbers();
  });
  
  postHook("OnMagicNumbersAndWorldSeedInitialized", () => {
    // TODO: does this run before or after this hook? or somewhere else entirely?

    // Update: my assumption would be that this has to run after OnMagicNumbers
    //         because that's the very first point where mods can
    //         grab the path to the biome map and add appends
    // (plus this hasn't broken so far)
    // (...i should just test shit)
    // (...except that i'm too lazy to even open the game)

    if (config.enableBiomeMap) {
      loadBiomeMap();
    }
  });
}
