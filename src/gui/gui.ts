import { hashIntFNV1a, hashStrFNV1a } from "../lib/hash";
import { printWarn } from "../log";
import { initRl } from "./raylib";

export const guis = new Map<number, GUI>();
export let totalCreatedGuis = 0; // todo warn when this keeps going up every frame

export class GUI {
  public readonly id: number;

  public readonly hashStack: (number | undefined)[] = [];
  public hash: number | undefined = undefined;

  public readonly options = new Set<number>();
  public readonly nextOptions = new Set<number>();

  public zIndex = 0;
  public nextZIndex = 0;
  public nextColor = [1, 1, 1, 1];

  constructor() {
    this.id = guis.size;
    guis.set(this.id, this);
    totalCreatedGuis++;
    initRl();
  }

  destroy() {
    guis.delete(this.id);
  }
  
  startFrame() {
    if (this.hashStack.length > 0) {
      printWarn("GUI", `GuiIdPop() wasn't called enough times! (${this.hashStack.length} pushes remained to the next frame)`);
      this.hashStack.length = 0;
      this.hash = undefined;
    }

    this.options.clear();
    this.nextOptions.clear();

    this.zIndex = 0;
    this.nextZIndex = 0;
    this.nextColor = [1, 1, 1, 1];
  }

  popId() { this.hash = this.hashStack.pop() }
  pushId(id: number | string) {
    this.hashStack.push(this.hash);
    this.hash = typeof id == "string"
      ? hashStrFNV1a(id, this.hash)
      : hashIntFNV1a(id, this.hash);
  }

  getId(id: number) {
    if (this.hash === undefined) return id;
    return hashIntFNV1a(id, this.hash);
  }
}
