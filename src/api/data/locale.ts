import { loadLocale, locale } from "../../reflect/locale";
import { printWarn } from "../../log";
import { config } from "../../config";

export function GameTextGetTranslatedOrNot(text: string) {
  if (typeof text != "string") return "";
  if (text.startsWith("$")) return GameTextGet(text);
  return text;
}

export function GameTextGet(key: string, ...params: string[]) {
  if (!config.enableLocalization) return key;
  if (!key.startsWith("$")) {
    printWarn("API", `GameTextGet() called with an invalid key (missing $): ${key}`);
    return "";
  }

  if (!locale) loadLocale();

  return locale!.translate(key, ...params);
}
