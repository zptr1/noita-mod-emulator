import { printError, printTrace, printWarn } from "../log";
import { Context } from "../context";
import cl from "chalk";

export interface Perk {
  id: string;
  name: string;
  description: string;
  uiIcon: string;
  perkIcon: string;
}

export function getPerks() {
  const ctx = new Context("reflect:perks");
  const perks: Perk[] = [];

  const definedIds = new Set<string>();

  ctx.execFileWithAPI("data/scripts/perks/perk_reflect.lua", {
    RegisterPerk(id: string, name: string, description: string, uiIcon: string, perkIcon: string) {

      if (definedIds.has(id)) {
        printError("Reflect", `Perk ${cl.redBright(id)} is already defined`);
        return;
      }

      const warn = (msg: string) => printWarn("Reflect", `Perk ${cl.yellow(id)} ${msg}`);

      if (!name) warn("has an empty name (this will crash the game!)");
      if (!description) warn("has an empty description (this will crash the game!)");
      if (uiIcon == perkIcon) warn("has the same ui icon and perk icon (these require different image sizes)");

      perks.push({ id, name, description, uiIcon, perkIcon });
      definedIds.add(id);
    }
  });

  printTrace("Reflect", "Retrieved", perks.length, "perks from perk_eflect.lua");
  return perks;
}
