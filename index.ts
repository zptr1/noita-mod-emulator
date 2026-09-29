import { getPerks, getSpells, getStatusEffects } from "./src/vm/reflect/data";
import { STATS } from "./src/storage";
import { join as pjoin } from "path";
import { load, run } from "./src/vm";

const steamapps = pjoin(process.env.HOME!, `.local/share/Steam/steamapps`);

load(
  `${steamapps}/common/Noita/data`,
  // modIds.map((x) => `${steamapps}/workshop/content/881100/${x}`)
  [
    `${steamapps}/workshop/content/881100/1985600131`
  ]
);

// fairmod 3357618827
// apoth 3032128572

run();

console.log(STATS);

getSpells();
getPerks();
getStatusEffects();

/*
Tested:
1975079109: gkbrkn_noita
3032128572: Apotheosis
3357618827: noita.fairmod
1974488139: anvil_of_destiny
1976795806: spellbound_bundle
1984977713: cheatgui
2012782536: Stats
2220664271: removable_perks
2284931352: seed_changer
2554761457: biome-plus
2564551181: short_fungal_shift_timer
2572385079: wand_dbg
2572658701: starting_perk
2744309004: QoL_mod
2793430913: magic_tools
2817946427: shuffled_biomes
2840072000: grahamsperks
2866701037: Hydroxide
2905495628: prismatic_wardrobe
3095221664: accel-seeds-only
3284126816: spell_lab_shugged
3299312539: evaisa.randomspawn
3313573016: souls
3419582553: spelldesc
3440115864: disable-mod-restrictions
3473790004: prospector-perk
3564206563: alt_fire_anything
3636565252: ui_timer_hits
3713134977: conga_worst_luck

Broken:
2006971887: more_shop (Error @ loadfile(mods/more_shop/init.lua): Unknown file)
3304764113: nightmare_mode_start (same as more_shop)
3635992834: parallel_parity (mods/parallel_parity/settings.lua:1482: attempt to compare nil with number)
*/