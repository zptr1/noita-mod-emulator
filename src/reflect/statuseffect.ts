import { printError, printTrace, printWarn } from "../log";
import { removeFalsyValues } from "../lib/util";
import { Context } from "../context";
import cl from "chalk";

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  protectsFromFire?: boolean;
  removeCellsThatCauseWhenActivated?: boolean;
  effectEntity?: string;
  minThresholdNormalized?: number;
  extraStatus?: string;
  permanent?: boolean;
  harmful?: boolean;
  uiTimerOffsetNormalized?: number;
}

export function getStatusEffects() {
  const ctx = new Context("reflect:status_effects");
  const statusEffects: StatusEffect[] = [];

  // const definedIds = new Set<string>();

  ctx.execFileWithAPI("data/scripts/status_effects/status_reflect.lua", {
    GameRegisterStatusEffect(id: string, name: string, description: string, ...args: any[]) {
      // TODO: Apparently effects can be grouped by minThresholdNormalized
      // Gonna remove this for now, and just output the list as it is.

      // if (definedIds.has(id)) {
      //   printError("Reflect", `Status effect ${id} is already defined`);
      //   return;
      // }

      const warn = (msg: string) => printWarn("Reflect", `Status effect ${cl.yellow(id)} ${msg}`);

      if (!name) warn("has an empty name (this will crash the game!)");
      if (!description) warn("has an empty description (this will crash the game!)");

      const effect: StatusEffect = removeFalsyValues<StatusEffect>({
        id, name, description,
        icon: args[0],
        protectsFromFire: args[1],
        removeCellsThatCauseWhenActivated: args[2],
        effectEntity: args[3],
        minThresholdNormalized: args[4],
        extraStatus: args[5],
        permanent: args[6],
        harmful: args[7],
        uiTimerOffsetNormalized: args[8]
      });

      statusEffects.push(effect);
      // definedIds.add(id);
    }
  });

  printTrace("Reflect", "Retrieved", statusEffects.length, "status effects from status_reflect.lua");
  return statusEffects;
}
