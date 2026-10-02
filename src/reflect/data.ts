import { Context } from "../context";
import { printTrace } from "../log";

// TODO

export function getSpells() {
  const ctx = new Context("reflect:spells");
  const spells: any[] = [];
  let currentProjs: string[] = [];

  ctx.execFileWithAPI("data/scripts/gun/gun_collect_metadata.lua", {
    RegisterGunAction(...args: any[]) {
      spells.push({
        raw: args,
        projectiles: currentProjs
      });

      currentProjs = [];
    },
    Reflection_RegisterProjectile(path: string) {
      currentProjs.push(path);
    }
  });

  printTrace("Reflect", "Retrieved", spells.length, "spells from gun_collect_metadata.lua");
  return spells;
}

export function getPerks() {
  const ctx = new Context("reflect:perks");
  const perks: any[][] = [];

  ctx.execFileWithAPI("data/scripts/perks/perk_reflect.lua", {
    RegisterPerk(...args: any[]) {
      perks.push(args);
    }
  });

  printTrace("Reflect", "Retrieved", perks.length, "perks from perk_eflect.lua");
  return perks;
}

export function getStatusEffects() {
  const ctx = new Context("reflect:status_effects");
  const statusEffects: any[][] = [];

  ctx.execFileWithAPI("data/scripts/status_effects/status_reflect.lua", {
    GameRegisterStatusEffect(...args: any[]) {
      statusEffects.push(args);
    }
  });

  printTrace("Reflect", "Retrieved", statusEffects.length, "status effects from status_reflect.lua");
  return statusEffects;
}
