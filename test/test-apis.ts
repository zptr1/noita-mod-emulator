import { PLACEHOLDER_FUNCS } from "../src/context/placeholders";
import { readFileSync } from "node:fs";
import * as API from "../src/api";

// List taken from noita lua defs
const s = new Set(readFileSync("test/apis.txt", "utf8").split("\n"));

const apis = new Set(
  Object.keys({ ...API.Base, ...API.Image })
    .filter((x) => x[0] != "_")
    .map((x) => x.startsWith("ctx$") ? x.slice(4) : x)
);

for (const func of PLACEHOLDER_FUNCS) apis.add(func);

apis.add("dofile");
apis.add("dofile_once");

for (const fn of s) {
  if (!apis.has(fn)) {
    console.log("Missing", fn);
  }
}
