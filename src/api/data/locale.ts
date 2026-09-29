import { parse } from "csv-parse/sync";
import { printDebug } from "../../log";
import { LOCALE } from "../../storage";
import { getFile } from "../../vfs";

function loadLocale() {
  printDebug("API", "Parsing locale");
  const data = parse(getFile("data/translations/common.csv") || "", {
    relaxColumnCount: true,
    relaxQuotes: true,
  });

  for (const [key, en] of data) {
    if (!key || !en) continue;
    LOCALE.set(`$${key}`, en);
  }

  LOCALE.set("", "");
}

export function GameTextGetTranslatedOrNot(text: string) {
  if (typeof text != "string") return "";
  if (text.startsWith("$")) return GameTextGet(text);
  return text;
}

export function GameTextGet(key: string, ...params: string[]) {
  if (!LOCALE.size) loadLocale();
  if (key.length == 1) return "en";
  if (!key) throw new Error("Crash! GameTextGet() called with an empty key");

  const val = LOCALE.get(key);
  if (!val) return "";

  return val.replace(/\$(\d+)/, (_, n) => params[Number(n)]);
}
