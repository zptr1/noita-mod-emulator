import { MAGIC_NUMBERS } from "../../storage";
import { parseXML } from "../../lib/xml";
import { printDebug } from "../../log";
import { getFile } from "../../vfs";

let magicNumberFiles: Set<string> | null = new Set();

export function $loadMagicNumbers() {
  if (!magicNumberFiles) return;

  for (const file of magicNumberFiles) {
    try {
      const data = parseXML(getFile(file) || "");
      const numbers = data[":@"] || {};
      let count = 0;

      if (!data.MagicNumbers) throw "Expected XML to contain <MagicNumbers>";

      for (const key in numbers) {
        MAGIC_NUMBERS.set(key, `${numbers[key]}`);
        count++;
      }

      printDebug("API", "Loaded", count, "magic numbers from", file);
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
