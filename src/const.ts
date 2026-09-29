import { arrayToLua } from "./lib/util";
import { resolvePath } from "./vfs";

// This goes into a mod setting, a persistent flag, a run flag, and an enabled mod,
// so that mods can detect if they're being emulated by checking any of these
export const EMULATOR = "NOITA_EMULATOR";

// All lua hook names in their call order
export const LUA_HOOKS = [
  "OnModPreInit",
  "OnModInit",
  "OnModPostInit",
  "OnMagicNumbersAndWorldSeedInitialized",
  "OnBiomeConfigLoaded",
  "OnWorldPreUpdate",
  "OnWorldPostUpdate",
  "OnWorldInitialized",
  "OnPlayerSpawned",
] as const;
export type LuaHook = typeof LUA_HOOKS[number];

// Taken from noita wiki
export const DEFAULT_SESSION_NUMBERS = {
  "is_biome_map_initialized": "false",
  "BIOME_MAP": "data/biome_impl/biome_map.png",
  "BIOME_MAP_PIXEL_SCENES": "data/biome/_pixel_scenes.xml",
  "NEW_GAME_PLUS_COUNT": "0",
  "DESIGN_SCALE_ENEMIES": "false",
  "DESIGN_NEW_GAME_PLUS_HP_SCALE_MIN": "1",
  "DESIGN_NEW_GAME_PLUS_HP_SCALE_MAX": "1",
  "DESIGN_NEW_GAME_PLUS_ATTACK_SPEED": "1",
} as const;

// Taken from noita wiki
export const DEFAULT_STATS = {
  "dead": false,
  "death_count": 0,
  "streaks": 0,
  "killed_by": "ur mom",
  "killed_by_extra": "",
  "playtime": 0,
  "playtime_str": "",
  "places_visited": 0,
  "enemies_killed": 0,
  "heart_containers": 0,
  "hp": 100,
  "gold": 0,
  "gold_all": 0,
  "gold_infinite": false,
  "items": 0,
  "projectiles_shot": 0,
  "kicks": 0,
  "damage_taken": 0,
  "healed": 0,
  "teleports": 0,
  "wands_edited": 0,
  "biomes_visited_with_wands": 0,
  "death_pos": arrayToLua([0, 0]),
} as const;

export const DEFAULT_GLOBALS = {
  "NEW_GAME_PLUS_ITERATION": "0",
} as const;

// Writing to this file will reset the loaded locale (if its loaded)
// so the next GameTextGet/GameTextGetTranslatedOrNot is up to date
export const LOCALE_PATH = resolvePath("data/translations/common.csv");
