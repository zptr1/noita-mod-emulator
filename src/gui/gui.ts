import { hashIntFNV1a, hashStrFNV1a } from "../lib/hash";
import { initRl } from "./raylib";

export const guis = new Map<number, GUI>();

export class GUI {
  public readonly id: number;

  public readonly hashStack: (number | undefined)[] = [];
  public hash: number | undefined = undefined;

  constructor() {
    this.id = guis.size;
    guis.set(this.id, this);
    initRl();
  }

  destroy() {
    guis.delete(this.id);
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
new GUI();