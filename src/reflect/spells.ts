import { removeFalsyValues } from "../lib/util";
import { printError, printTrace, printWarn } from "../log";
import { Context } from "../context";
import cl from "chalk";

let currentProjs: string[] = [];

export const SPELL_TYPES = [
  "projectile",
  "static_projectile",
  "modifier",
  "multicast",
  "material",
  "other",
  "utility",
  "passive",
  "unknown"
] as const;

export type SpellType = typeof SPELL_TYPES[number];

export interface Spell {
  id: string;
  name: string;
  description: string;
  spriteFile: string;
  unidentifiedSpriteFile: string;
  type: SpellType;
  spawn: {
    levels: {
      level: number,
      probability: number,
    }[];
    requiresFlag?: string;
    manualUnlock?: boolean;
  };
  customXMLFile: string;
  stats: Partial<{
    maxUses: number;
    castDelay: number;
    rechargeTime: number;
    manaDrain: number;
    drawCount: number;
    speedMultiplier: number;
    childSpeedMultiplier: number;
    dampening: number;
    explosionRadius: number;
    spreadDegrees: number;
    patternDegrees: number;
    screenshake: number;
    recoil: number;
    explosionDamageToMaterials: number;
    knockbackForce: number;
    lightningCount: number;
    bounces: number;
    gravity: number;
    light: number;
    bloodMultiplier: number;
    goreParticles: number;
    lifetimeAdd: number;
  }>;
  addedDamage: Partial<{
    melee: number;
    projectile: number;
    electricity: number;
    fire: number;
    explosion: number;
    ice: number;
    slice: number;
    healing: number;
    curse: number;
    drill: number;
    nullAll: number;
    critChance: number;
    critMultiplier: number;
  }>;
  flags: Partial<{
    friendlyFire: boolean;
    isDangerousBlast: boolean;
    aiNeverUses: boolean;
    neverUnlimited: boolean;
  }>;
  state: Partial<{
    shuffled: boolean;
    drawnCards: number;
    discadedAction: boolean;
    destroyedAction: boolean;
  }>;
  material?: { material: string; amount: number };
  trail?: { material: string; amount: number };
  ragdollFx?: number;
  physicsImpulseCoeff?: number;
  sprite?: string;
  extraEntities?: string[];
  gameEffectEntities?: string;
  soundLoopTag?: string;
  projectileFile?: string;

  projectiles: string[];
}

function parseSpell(args: any[]): Spell {
  const spellId = args[0];
  const spellType = SPELL_TYPES[args[5]];

  const spawnLevels: string[] = args[6].split(",");
  const spawnProbs: string[] = args[7].split(",");

  const warn = (msg: string) => printWarn("Reflect", `Spell ${cl.yellow(spellId)} ${msg}`);

  if (spawnLevels.length != spawnProbs.length) {
    warn(`defines ${spawnLevels.length} spawn levels and ${spawnProbs.length} probs (expected equal, got different)`);
  }

  if (!spellType) {
    warn(`has an invalid spell type (${args[5]})`);
  }

  // TODO: i know that's the case for perks, is that true for spells and status effects too?
  if (!args[1]) warn(`has an empty name (this will crash the game!)`);
  if (!args[2]) warn(`has an empty description (this will crash the game!)`);

  const one2undef = (v: number) => v == 1 ? undefined : v;
  const material = (material?: string, count?: number, key="material") => {
    if (!material && !count) return;
    if (!material) warn(`defines ${key} file but not count`);
    if (!count) warn(`defines ${key} count but not file`);
    return { material, count } as any;
  };

  // holy fucking shit, a 64 argument function
  // (nolla jank be like)
  return {
    id: spellId,
    name: args[1],
    description: args[2],
    spriteFile: args[3],
    unidentifiedSpriteFile: args[4],
    type: spellType || "unknown",
    spawn: removeFalsyValues({
      levels: spawnLevels.map(
        (x, i) => ({
          level: parseInt(x),
          probability: parseFloat(spawnProbs[i])
        })
      ),
      requiresFlag: args[8],
      manualUnlock: args[9],
    }),
    stats: removeFalsyValues({
      maxUses: args[10],
      rechargeTime: args[45],
      castDelay: args[21],
      manaDrain: args[12],
      drawCount: args[14],
      speedMultiplier: one2undef(args[22]),
      childSpeedMultiplier: one2undef(args[23]),
      dampening: one2undef(args[24]),
      explosionRadius: args[25],
      spreadDegrees: args[26],
      patternDegrees: args[27],
      screenshake: args[28],
      recoil: args[29],
      explosionDamageToMaterials: args[43],
      knockbackForce: args[44],
      lightningCount: args[46],
      bounces: args[51],
      gravity: args[52],
      light: args[53],
      bloodMultiplier: one2undef(args[54]),
      goreParticles: args[55],
      lifetimeAdd: args[59],
    }),
    flags: removeFalsyValues({
      isDangerousBlast: args[13],
      aiNeverUses: args[15],
      neverUnlimited: args[16],
      friendlyFire: args[57],
    }),
    state: removeFalsyValues({
      shuffled: args[17],
      drawnCards: args[18],
      discadedAction: args[19],
      destroyedAction: args[20],
    }),
    addedDamage: removeFalsyValues({
      melee: args[30],
      projectile: args[31],
      electricity: args[32],
      fire: args[33],
      explosion: args[34],
      ice: args[35],
      slice: args[36],
      healing: args[37],
      curse: args[38],
      drill: args[39],
      nullAll: args[40],
      critChance: args[41],
      critMultiplier: args[42],
    }),
    customXMLFile: args[11],
    material: material(args[47], args[48]),
    trail: material(args[49], args[50], "trail"),
    ragdollFx: args[56],
    physicsImpulseCoeff: args[58],
    sprite: args[60],
    extraEntities: args[61]
      ? args[61].split(",").filter((x: string) => !!x)
      : undefined,
    gameEffectEntities: args[62],
    soundLoopTag: args[63],
    projectileFile: args[64],

    projectiles: currentProjs
  };
}

export function getSpells() {
  const ctx = new Context("reflect:spells");
  const spells: any[] = [];

  const definedIds = new Set<string>();

  ctx.execFileWithAPI("data/scripts/gun/gun_collect_metadata.lua", {
    RegisterGunAction(...args: any[]) {
      const spellId = args[0];

      if (definedIds.has(spellId)) {
        printError(`Spell ${cl.redBright(spellId)} is already defined`);
        return;
      }

      const spell = removeFalsyValues(parseSpell(args));

      definedIds.add(spellId);
      spells.push(spell);
      currentProjs = [];
    },
    Reflection_RegisterProjectile(path: string) {
      currentProjs.push(path);
    }
  });

  currentProjs = [];

  printTrace("Reflect", "Retrieved", spells.length, "spells from gun_collect_metadata.lua");
  return spells;
}
