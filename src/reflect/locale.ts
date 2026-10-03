import { LOCALE_KEYS, LOCALE_PATH, LocaleKey } from "../const";
import * as CSV from "csv-parse/sync";
import { printWarn } from "../log";
import { config } from "../config";
import { getFile } from "../vfs";

export type LocaleFile = Record<LocaleKey, Record<string, string>>;
export let locale: ReturnType<typeof parseLocale> | null = null;

export function parseLocale(raw: string) {
  const data = CSV.parse(raw || "", {
    relaxColumnCount: true,
    relaxQuotes: true,
  });

  const locale = {} as LocaleFile;
  for (const key of LOCALE_KEYS) {
    locale[key] = {};
  }

  for (const line of data.slice(1)) {
    if (!line[0]) continue;

    const key = line[0];
    for (let idx = 0; idx < LOCALE_KEYS.length; idx++) {
      const lang = LOCALE_KEYS[idx];
      const value = line[idx + 1];

      if (!value) continue;

      locale[lang][key] = value.replace(/\\n/g, "\n");
    }
  }

  return {
    raw: data,
    locale,
    translate(key: string, ...values: any[]) {
      if (key.length == 0) {
        throw new Error(`Passed an empty translation key (this will crash the game!)`);
      }

      if (key[0] != "$") return key;
      if (key == "$") return config.language;

      key = key.slice(1);
      const value = locale[config.language][key] || locale["en"][key];

      if (!value) {
        printWarn("Reflect", `Untranslated key: ${key}`);
        return "";
      }

      return value.replace(
        /\$(\d)/g,
        (_, n) => {
          const value = values[Number(n)];
          if (typeof value == "undefined") {
            printWarn("Reflect", `Tried to translate ${key} with a missing parameter $${n}`);
          }

          return `${value}`;
        }
      );
    }
  };
}

export function loadLocale() {
  if (locale) return locale;
  locale = parseLocale(getFile(LOCALE_PATH) || "");
  return locale;
}

export function resetLocale() {
  locale = null;
}
