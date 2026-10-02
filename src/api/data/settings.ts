import { SETTING_KEYS, SETTINGS } from "../../storage";

export const ModSettingGet = (key: string) => SETTINGS.get(key)?.[0] ?? null;
export function ModSettingSet(key: string, value: any) {
  if (!SETTINGS.has(key)) {
    SETTING_KEYS.push(key);
    SETTINGS.set(key, [value, null]);
  } else {
    SETTINGS.get(key)![0] = value;
  }
}

export const ModSettingGetNextValue = (key: string) => SETTINGS.get(key)?.[1] ?? "";
export function ModSettingSetNextValue(key: string, value: any) {
  if (!SETTINGS.has(key)) {
    SETTING_KEYS.push(key);
    SETTINGS.set(key, [null, value]);
  } else {
    SETTINGS.get(key)![1] = value;
  }
}

export function ModSettingRemove(key: string) {
  if (!SETTINGS.has(key)) return false;

  SETTINGS.delete(key);
  const idx = SETTING_KEYS.indexOf(key);
  if (idx > -1) SETTING_KEYS.splice(idx, 1);

  return true;
}

export const ModSettingGetCount = () => SETTING_KEYS.length;
export function ModSettingGetAtIndex(idx: number) {
  const key = SETTING_KEYS[idx];
  if (!key) return null;

  const setting = SETTINGS.get(key) ?? [null, null];
  return [key, ...setting];
}
