import { $loadLocale } from "../api/data";
import { LOCALE } from "../storage";
import { printWarn } from "../log";

export interface BaseReflectionItem {
  id: string;
  name: string;
  description: string;
}

export function translateReflection<T extends BaseReflectionItem>(list: T[], type: string): T[] {
  if (!LOCALE.size) $loadLocale();

  const translate = (thing: T, key: string) => {
    const value = thing[key];

    if (value[0] != "$") return value;
    if (value.length == 1) return "en";

    const out = LOCALE.get(value);
    if (!out) {
      printWarn("Reflect", `${type} ${thing.id}'s ${key} refers to an unknown translation key (${value})`);
      return value;
    }

    if (/\$\d/.test(out)) {
      printWarn("Reflect", `${type} ${thing.id}'s ${key} refers to a translation key with arguments (${value} -> "${out}")`);
      return value;
    }

    return out;
  };

  for (const item of list) {
    item.name = translate(item, "name");
    item.description = translate(item, "description");
  }

  return list;
}
