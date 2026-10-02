import { mkdirSync } from "node:fs";
import { build } from "esbuild";

mkdirSync("dist", { recursive: true });

// Something like this?.. TODO

await build({
  platform: "node",
  entryPoints: ["src/index.ts"],
  outfile: "dist/lib.mjs",
  bundle: true,
  format: "esm",
  packages: "external",
  target: ["node22"],
});

await build({
  platform: "node",
  entryPoints: ["src/cli/index.ts"],
  outfile: "dist/cli.js",
  bundle: true,
  format: "esm",
  packages: "external",
  target: ["node22"],
  banner: {
    js: "#!/usr/bin/node"
  }
});
