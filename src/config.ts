import { tryFindGameDir, tryFindWorkshopDir } from "./lib/util";

export const config = {
  worldSeed: 0,
  gamePath: tryFindGameDir(),
  workshopPath: tryFindWorkshopDir(),
  enableImageEditing: true,
  enableLocalization: true,
  enableBiomeMap: true,
};

export function setConfig(newConfig: Partial<typeof config>) {
  for (const key in newConfig) {
    config[key] = newConfig[key];
  }
}
