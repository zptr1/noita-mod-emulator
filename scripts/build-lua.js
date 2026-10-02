import { execFileSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { join as pjoin } from "node:path";

const includeDir = pjoin(import.meta.dirname, "include");

try {
  const require = createRequire(import.meta.url);
  const path = require.resolve("lua-state/build/Release/lua-state.node");
  if (existsSync(path)) {
    unlinkSync(path);
    console.log("Removed the old lua-state.node file");
  }
} catch {}

console.log("Building lua-state...");
// I am starting to regret writing this entire project in JavaScript...

execFileSync(
  "npx", [
    "lua-state", "install",
    "--mode=system", "--libraries=-lluajit-5.1",
    `--include-dirs=${includeDir}`
  ], {
    stdio: "inherit"
  }
);
