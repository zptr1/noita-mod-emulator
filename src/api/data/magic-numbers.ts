import { XMLParser } from "fast-xml-parser";
import { MAGIC_NUMBERS } from "../../storage";
import { printDebug } from "../../log";
import { getFile } from "../../vfs";

let magicNumberFiles: Set<string> | null = new Set();

export function $loadMagicNumbers() {
  if (!magicNumberFiles) return;

  const parser = new XMLParser({
    allowBooleanAttributes: true,
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });

  for (const file of magicNumberFiles) {
    try {
      const numbers = parser.parse(getFile(file) || "")["MagicNumbers"];
      let n = 0;

      for (const key in numbers) {
        MAGIC_NUMBERS.set(key, `${numbers[key]}`);
        n++;
      }

      printDebug("API", "Loaded", n, "magic numbers from", file);
    } catch (err) {
      console.warn(`Error loading magic numbers from ${file}`);
      console.warn(err);
    }
  }

  magicNumberFiles = null;
}

export function ModMagicNumbersFileAdd(file: string) {
  if (!magicNumberFiles) return;
  magicNumberFiles.add(file);
}

export const MagicNumbersGetValue = (key: string) => MAGIC_NUMBERS.get(key) || "";
export const GameGetOrbCountTotal = () => Number(MAGIC_NUMBERS.get("NUM_ORBS_TOTAL")) || 0;
