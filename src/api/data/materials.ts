// TODO
// not included yet

import { parseXML } from "../../lib/xml";
import { printWarn } from "../../log";
import { getFile } from "../../vfs";

let materialFiles: Set<string> | null = new Set<string>();
const reactionKeys = new Set<string>();
const reactionsToAdd: any[] = [];

export const materialNames = new Map<string, Material>();
export const wangColors = new Map<string, Material>();
export const materials: Material[] = [];

export const reactions: Reaction[] = [];

export interface Material {
  id: number;
  name: string;
  uiName: string;
  wangColor: string;
  cellType: string;
  tags: string[];
  reactions: Reaction[];
  
  attributes: any;
  rawData: any;
  
  addedFrom: string;
  extendedFrom: string[];
}

export interface Reaction {
  probability: number;
  /** String when it's a tag */
  input: [Material | string, Material | string, (Material | string)?];
  output: [Material, Material, Material?];
  addedFrom: string;
}

function loadMaterialsFrom(file: string) {
  const content = getFile(file);
  if (!content) throw "Unknown file";
  
  const data = parseXML(getFile(file)!);

  for (const thingy of data["Materials"]) {
    const attr = thingy[":@"];
    let material = {};

    if (thingy.Reaction) {
      reactionsToAdd.push({
        input: [attr.input_cell1, attr.input_cell2, attr.input_cell3],
        output: [attr.output_cell1, attr.output_cell2, attr.output_cell3],
      });
      continue;
    }

    if (thingy.CellDataChild) {
      const parent = materialNames.get(attr._parent);
      if (!parent) throw `Unknown parent material ${attr._parent} for CellDataChild ${attr.name}`;

      material = { ...parent };
    }
  }
}

export function $loadMaterials() {
  if (!materialFiles) return;

  for (const file of materialFiles) {
    try {
      loadMaterialsFrom(file);
    } catch (err) {
      printWarn("API", `Error loading materiasl from ${file}: ${err.stack || err}`);
    }
  }
  
  materialFiles = null;
}

export function ModMaterialsFileAdd(file: string) {
  if (!materialFiles) return;
  materialFiles.add(file);
}
