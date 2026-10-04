import { activeMods, activeModsById, availableMods, gameCtx, load, loadGame, runHook, runSettings } from "../../vm";
import { baseRun, wrapError } from "../util";
import repl, { REPLServer } from "node:repl";
import { LUA_HOOKS } from "../../const";
import { Context } from "../../context";
import cl from "chalk";

let server: REPLServer | null = null;
let activeCtx: Context | null = null;

const hooks = [...LUA_HOOKS];

function getPrompt() {
  if (!activeCtx || activeCtx == gameCtx) {
    return cl.bold(`[${cl.yellow("game")}] > `);
  }

  return cl.bold(`[${cl.green(activeCtx.id)}] > `);
}

function setCtx(ctx: Context) {
  activeCtx = ctx;
  if (server) server.setPrompt(getPrompt());
}

function formatReplObject(obj: any, depth = 0, circular = new Set<any>()) {
  if (circular.has(obj)) return cl.cyan("[circular]");
  if (typeof obj == "string") return cl.green(JSON.stringify(obj));
  if (typeof obj == "number" || typeof obj == "boolean") return cl.yellow(obj);
  if (typeof obj == "function") return cl.cyan("[function]");
  if (typeof obj != "object" || obj == null) return cl.bold("nil");
  if (depth > 2) return "{ ... }";

  const out = ["{"];
  const keys = Object.keys(obj);
  let length = 0;
  
  circular.add(obj);

  for (let idx = 0; idx < keys.length; idx++) {
    const key = keys[idx];
    const value = obj[key];

    const fmt = (
      isNaN(Number(key)) ? `${key} = ` : ""
    ) + formatReplObject(value, depth + 1, circular) + (
      idx < keys.length - 1 ? "," : ""
    );

    length += fmt.length;
    out.push(fmt);
  }

  if (length > 60) {
    const tab = " ".repeat((depth + 1) * 2);
    const lowerTab = " ".repeat(depth * 2);

    return out.join(`\n${tab}`) + `\n${lowerTab}}`;
  }

  return out.join(" ") + " }";
}

function initReplCommands() {
  if (!server) return;
  for (const command in server.commands) {
    if (command == "help") continue;

    // Why is this a "NodeJS.ReadOnlyDict" when you can delete from it?..
    delete (server.commands as any)[command];
  }

  // annoying
  const penis = () => server?.displayPrompt();

  server.defineCommand("load", {
    help: "Load a mod ID or path (available only before any execution)",
    action(mod) {
      mod = mod.trim();
      wrapError(() => {
        if (!mod) throw "Missing mod ID or path";
        load([mod]);
      });

      penis();
    }
  });

  server.defineCommand("mods", {
    help: "Show all available mods and loaded mods",
    action() {
      console.log("Active mods: (in order)");
      console.log(activeMods.map((x) => cl.green(x.id)).join(", "));

      console.log("\nAvailable mods:");
      console.log(
        [...availableMods.values()]
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((x) => cl.green(x.id))
          .join(", ")
      );

      penis();
    }
  });

  server.defineCommand("start", {
    help: "Start execution",
    action() {
      wrapError(runSettings);
      console.log(cl.bold("Use .next to run the next hook"));
      console.log(cl.bold("Use .all to run all hooks in order"));
      penis();
    }
  });

  server.defineCommand("next", {
    help: "Run the next hook",
    action() {
      wrapError(() => {
        const hook = hooks.shift();
        if (!hook) throw `Execution finished`;

        console.log(cl.bold(`Running hook ${hook}`));
        runHook(hook);
      });

      penis();
    }
  });

  server.defineCommand("all", {
    help: "Run all hooks in order",
    action() {
      wrapError(() => {
        if (!hooks.length) throw `Execution finished`;
        while (hooks.length) {
          const hook = hooks.shift()!;
          console.log(cl.bold(`Running hook ${hook}`));
          runHook(hook);
        }
      });

      penis();
    }
  });

  server.defineCommand("ctx", {
    help: "Change the current context (run the command to see a list of available contexts)",
    action(id) {
      id = id.trim();

      if (id == "vanilla") {
        setCtx(gameCtx);
        return penis();
      }

      const mod = activeModsById.get(id);
      if (mod) {
        setCtx(mod.ctx);
      } else {
        console.log("Available contexts:");
        console.log(" -", cl.yellow("vanilla"));
        for (const mod of activeMods) {
          console.log(" -", cl.green(mod.id));
        }
      }

      penis();
    }
  })
}

export function startRepl(opts: any, args: any[]) {
  wrapError(
    () => baseRun(opts, args, true),
    true
  );
  
  console.log("");
  console.log(`Type ${cl.bold(".help")} for help`);
  console.log("");

  if (!gameCtx) {
    loadGame();
  }

  activeCtx = gameCtx;

  server = repl.start({
    prompt: getPrompt(),
    ignoreUndefined: true,
    completer: () => [],
    writer: (obj) => formatReplObject(obj),
    eval(code, _ctx, _file, cb) {
      runLua(code.trim(), cb);
    }
  });

  initReplCommands();
}

function runLua(code: string, cb: any) {
  try {
    const res = activeCtx!.lua.eval(code);

    cb(null, res);
  } catch (err) {
    const msg = `${err.message || err}`;

    if (
      /near '<eof>'/.test(msg)
      && !/'=' expected/.test(msg)
    ) {
      return cb(new repl.Recoverable(err), null);
    }

    cb(err, null);
  }
}
