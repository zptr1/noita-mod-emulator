import * as API from "./src/api";
import { Context } from "./src/context";
import { readFileSync } from "node:fs";

const s = new Set(readFileSync("tmp.txt", "utf8").split("\n"));
const blank = new Set(API.$blankFunctions.map((x) => x.list).flat());
for (const fn of s) {
  if (!API[fn] && !blank.has(fn)) {
    console.log("Missing", fn);
  }
}
