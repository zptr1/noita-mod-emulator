import { parse } from "csv-parse/sync";
import { printTrace } from "../../log";
import { LOCALE } from "../../storage";
import { config } from "../../config";
import { getFile } from "../../vfs";

export function $loadLocale() {
  printTrace("API", "Parsing locale");
  const data = parse(getFile("data/translations/common.csv") || "", {
    relaxColumnCount: true,
    relaxQuotes: true,
  });

  for (const [key, en] of data) {
    if (!key || !en) continue;
    LOCALE.set(`$${key}`, en);
  }

  LOCALE.set("", "");
  return LOCALE;
}

export function GameTextGetTranslatedOrNot(text: string) {
  if (typeof text != "string") return "";
  if (text.startsWith("$")) return GameTextGet(text);
  return text;
}

export function GameTextGet(key: string, ...params: string[]) {
  if (!config.enableLocalization) return key;

  if (!LOCALE.size) $loadLocale();
  if (key.length == 1) return "en";
  if (!key) throw new Error("Crash! GameTextGet() called with an empty key");

  const val = LOCALE.get(key);
  if (!val) return "";

  return val.replace(/\$(\d+)/g, (_, n) => params[Number(n)]);
}
