import { chmodSync, mkdirSync } from "node:fs";
import { build, context } from "esbuild";

mkdirSync("dist", { recursive: true });

const libCtx = await context({
  platform: "node",
  entryPoints: ["src/index.ts"],
  outfile: "dist/lib.mjs",
  bundle: true,
  format: "esm",
  packages: "external",
  target: ["node22"],
  banner: {
    js: "#!/usr/bin/node"
  }
});

const cli = "dist/cli.js";
const cliCtx = await context({
  platform: "node",
  entryPoints: ["src/cli/index.ts"],
  outfile: cli,
  bundle: true,
  format: "esm",
  packages: "external",
  target: ["node22"],
  banner: {
    js: "#!/usr/bin/node"
  },
  plugins: [{
    name: "make-executable",
    setup(build) {
      build.onEnd((res) => {
        if (res.errors.length) return;
        try {
          chmodSync(cli, 0o755);
        } catch {}
      })
    }
  }]
});

if (process.argv.includes("watch")) {
  console.log("Watching for changes (CLI)");
  await cliCtx.watch();
}
