import { execFileSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join as pjoin } from "node:path";

// These are included here in the repo to avoid cross-platform headaches
const includeDir = pjoin(import.meta.dirname, "include/luajit-2.1");

try {
  const require = createRequire(import.meta.url);

  // require.resolve("build/...") didn't work for some reason
  const luaState = pjoin(require.resolve("lua-state"), "../../");
  const path = pjoin(luaState, "build/Release/lua-state.node");

  if (existsSync(path)) {
    unlinkSync(path);
    console.log("Removed the old lua-state.node file");
  }
} catch (err) { console.log(err); }

console.log("Building lua-state...");

try {
  execFileSync(
    "npx", [
      "lua-state", "install",
      "--mode=system", "--libraries=-lluajit-5.1",
      `--include-dirs=${includeDir}`
    ], {
      stdio: "inherit"
    }
  );
} catch (err) {
  console.error("Could not rebuild lua-state:");
  console.error(err);
  console.error("");
  console.error("Make sure you have LuaJIT installed locally including its development headers and libraries.");
  console.error("You also need development tools (node-gyp, gcc).");
  process.exit();
}

console.log("lua-state compiled successfully");
