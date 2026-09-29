import { BOOL_VALUES, GAME_FLAGS, GLOBALS, INT_VALUES, NUMBER_VALUES, PERSISTENT_FLAGS, SESSION_NUMBERS } from "../../storage";
import { DEFAULT_STATS } from "../../const";
import { config } from "../../config";

export const HasFlagPersistent = (flag: string) => PERSISTENT_FLAGS.has(flag);
export const RemoveFlagPersistent = (flag: string) => void PERSISTENT_FLAGS.delete(flag);
export function AddFlagPersistent(flag: string) {
  if (PERSISTENT_FLAGS.has(flag)) {
    return false;
  }
  
  PERSISTENT_FLAGS.add(flag);
  return true;
}

export const GameAddFlagRun = (flag: string) => void GAME_FLAGS.add(flag);
export const GameRemoveFlagRun = (flag: string) => GAME_FLAGS.delete(flag);
export const GameHasFlagRun = (flag: string) => GAME_FLAGS.has(flag);

export const GlobalsSetValue = (key: string, value: any) => void GLOBALS.set(key, value);
export const GlobalsGetValue = (key: string, def?: any) => GLOBALS.get(key) ?? def ?? "";

export const SetValueNumber = (key: string, value: number) => void NUMBER_VALUES.set(key, value);
export const GetValueNumber = (key: string, def: number) => NUMBER_VALUES.get(key) ?? def;

export const SetValueInteger = (key: string, value: number) => void INT_VALUES.set(key, value);
export const GetValueInteger = (key: string, def: number) => INT_VALUES.get(key) ?? def;

export const SetValueBool = (key: string, value: boolean) => void BOOL_VALUES.set(key, value);
export const GetValueBool = (key: string, def: boolean) => BOOL_VALUES.get(key) ?? def;

export function StatsGetValue(key: string) {
  if (key == "world_seed") return config.worldSeed;
  return DEFAULT_STATS[key] ?? "";
}

export const StatsGlobalGetValue = StatsGetValue;
export const StatsBiomeGetValue = StatsGetValue;

export const SessionNumbersGetValue = (key: string) => SESSION_NUMBERS.get(key) || "";
export function SessionNumbersSetValue(key: string, value: string) {
  SESSION_NUMBERS.set(key, `${value}`);
}
