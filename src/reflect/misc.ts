import { loadLocale } from "./locale";
import { printError } from "../log";

export interface BaseReflectionItem {
  id: string;
  name: string;
  description: string;
}

export function translateReflection<T extends BaseReflectionItem>(list: T[], type: string): T[] {
  const locale = loadLocale();

  for (const item of list) {
    try {
      item.name = locale.translate(item.name);
      item.description = locale.translate(item.description);
    } catch (err) {
      printError("Reflect", `Error translating ${type} ${item.id}: ${err}`);
    }
  }

  return list;
}
