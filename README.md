# Noita Mod Emulator

**Noita Mod Emulator** lets you run and debug Noita mods programmatically outside of the game. It runs Noita mods via LuaJIT, providing an emulated API, VFS and execution model that replicates Noita's.

You can use this to

- debug & test your mods locally
- export data from mods (spells, perks, etc) to test compatibility between mods and automatically generate mod wikis
- export debug info (lua globals, virtual filesystem, flamegraphs showing dofile/API call counts and durations, etc)
- quickly test your mods for errors without having to restart the game frequently (the tool has plenty of checks that warn you about common mistakes!)
- other shit idk

> Keep in mind this tool is **WIP**, not all APIs are implemented properly, some mods might error, and there are many features that I still want to implement. The emulation is not 100% accurate, but as far as I know its the best recreation anyone's made so far.

## Table Of Contents

- [Install](#install)
- [Usage](#usage)
  - [Config](#config)
  - [Game Data](#game-data)
  - [Mod List](#mod-list)
  - [Running Mods](#running-mods)
  - [Profiler](#profiler)
  - [Reflection](#reflection)
- [Lua API Additions](#lua-api-additions)
  - [Working with the profiler](#working-with-the-profiler)
- [List of things that needs further testing](#list-of-things-that-needs-further-testing)
- [Sandbox Security](#sandbox-security)

## Install

You need to have LuaJIT installed on your system including its development headers and libraries. You will also need development tools such as `node-gyp`.

Noita uses **Lua 5.1** compiled with **LuaJIT 2.1** for mods. This emulator requires the same version, because a lot of mods will be broken otherwise. This tool will try to get the correct Lua version on install, but if you still have the wrong version, try running [`scripts/build-lua.mjs`](./scripts/build-lua.mjs); it'll try to build the right version.

<!-- You can install **Noita Mod Emulator** via **npm**:
```sh
$ npm i -g noita-emu
``` -->

<!-- To install manually: -->
**Noita Mod Emulator** is currently not on npm, so you have to install it manually by cloning the repo:
```sh
$ git clone https://github.com/zptr1/noita-mod-emulator
$ cd noita-mod-emualtor
$ npm install && npm run build && npm link
```
This will make `noita-emu` usable anywhere as a CLI.

## Usage

Use `noita-emu` to run the CLI. The following reference is pimarily for the CLI, but you can use this as a JavaScript library too.

Please note that everything is subject to change since this tool is a **work-in-progress**, although I will try not to make too many breaking changes, output formats and options might still change in the future.

### Config

- `--game-dir <dir>` (`-g`): game directory (see the next section)
- `--log-level <level>` (`-l`): log level (`0` = debug, `1` = trace, `2` = info, `3` = warn, `4` = error). Pass any number higher than the max if you really want to suppress everything.
- `--seed <seed>` (`-s`): world seed used for the Random API. The emulator has a 100% accurate recreation of Noita's PRNG, so if a mod has, for example, random spells (like Fairmod's TMTRAINER) this option will make the generated output match your world
- `--locale <code>`: what language to use for locale APIs (allowed codes are `en`, `ru`, `pt-br`, `es-es`, `de`, `fr-fr`, `it`, `pl`, `zh-cn`, `jp`, `ko`)
- `--fatal-errors`: makes all errors exit the program instead of continuing execution to the end
- `--unsafe-api`: enable unsafe Lua APIs. This allows libraries like `io`, `os`, etc. to be used anywhere, so **proceed with caution**. Please note that FFI is not supported, and this option might get removed in the future when I switch to custom WASM bindings.

You can disable several individual modules, which replaces them with blank functions:
- `--no-rng` disables PRNG (all functions return the minimum allowed value)
- `--no-image` disables image editing (can greatly improve performance depending on the mod)
- `--no-locale` disables locale file parsing
- `--no-biome-map` disables biome map generation

If using as a library, call `setConfig({ … })` to update the config; this will apply the passed object on top of the defaults.

### Game Data

The emulator tries to automatically detect the game's path using a few common paths, but if it fails, you need to specify it manually via the `--game-dir` (`-g`) flag.

You can use the `set-game-dir` command to permanently change the default path:
```sh
$ noita-emu set-game-dir "~/.local/share/Steam/steamapps/common/Noita"  # linux
$ noita-emu set-game-dir "C:/Program Files (x86)/Steam/steamapps/common/Noita"  # windows
```

The folder **must contain** the Noita's `data` folder, along with `data/data.wak`.

### Mod List

The emulator tries to load a list of mods from the game's `mods` folder, and Steam Workshop (`Steam/steamapps/workshop/content/881100`) if it exists. If a mod has `mod_id.txt`, that file's contents will be used as the mod's ID; otherwise it'll use the name of the directory. A mod **must contain** `mod.xml`, or the emulator will refuse to load it and error.

When given a mod, the emulator will first try to use that as a mod ID, and will fall back to a directory path if there's no mod with that ID.

You can run `noita-emu mods` to get a list of all detected mods.

**Library APIs:**
- `detectMods()` detects all available mods and returns a map of `mod ID` -> `{ id, path }`
- `loadModListFromDir(dir: string)` detects all available mods from the specified directory

### Running mods

Use `noita-emu run [mods...]` to run mods in the specified order. If you do not pass any mods, this will run the current working directory as a mod, provided it has `mod.xml`.

Mods are executed like this, respecting the specified order:
1. load vanilla game & all mods to the VFS
2. run `settings.lua` and call `ModSettingsUpdate(0)` for every mod
3. run vanilla game's `data/scripts/init.lua` in the vanilla context
4. run `init.lua` for every mod in that mod's context
5. run every hook one by one:
   * `OnModPreInit`
   * `OnModInit`
   * `OnModPostInit`
   * `OnMagicNumbersAndWorldSeedInitialized`
   * `OnBiomeConfigLoaded`
   * `OnWorldPreUpdate`
   * `OnWorldPostUpdate`
   * `OnWorldInitialized`

Each hook is first ran in the vanilla context, then in every mod's own context.

After step 1, execution will continue to the very end even if an error occurs during one of these steps. Use `--fatal-errors` to make errors fatal. The CLI will exit with a non-zero exit code if at least one error has been reported at any time.

You can use the `--stop-after <hook>` flag to stop execution after the specified hook. For example, if you just want to export spells/perks, `OnMagicNumbersAndWorldSeedInitialized` is a good stopping point.

**Library APIs:**
- `load(mods: string[])` loads the provided list of mods (either by mod ID or path)
- `loadModById(id)` loads the mod by its ID
- `loadModFromDir(path)` loads the mod from a directory
- `preHook(hook, listener)` runs the function right before the hook runs
- `postHook(hook, listener)` runs the function right after the hook finishes running
- `run()` starts execution
- `stop()` stops execution (combine with preHook/postHook to control where to stop)
- `runSettings()` runs mod settings; can only be called once. Automatically called by `run()` if it hasn't been called before
- `runHook(hook, ...args)` can be used to run a hook manually

### Profiler

You can enable the profiler with `--prof` (`-p`). There are two modes: **duration mode** (default) and **call count mode** (`--prof-counts`). You can change the output file with `--prof-file <path>`.

This generates a flamegraph containing every `dofile`/`dofile_once` and all Noita API calls, including stack traces. The flamegraph can be viewed on https://speedscope.app.

The duration mode exports numbers in milliseconds. If there are multiple identical calls in the same place, the duration gets aggregated into a single entry. Numbers in the the call count mode simply mean how many times has this label been called.

Labels:
- `hook:Name()` is used for hooks during execution (e.g. `hook:OnModPreInit()`)
- `"path/to/file"` is used for `dofile_once()`
- `"path/to/file"*` (with an asterisk at the end) is used for `dofile()`
- `FunctionName()` is used for all Noita Lua APIs (e.g. `ModImageSetPixel()`)

> You can add custom labels from inside of your mod! See [Lua API Additions](#lua-api-additions)

**The duration mode is not accurate!** Only use this as a baseline or for debugging.
- half of all Noita APIs in this emulator are just blank functions; calling them is instant (unlike in-game)
- the latency from FFI (`Lua <-> C++ <-> JavaScript`) can add up quickly for repeated API calls. Using `bun` or `Deno` instead of `node` can improve this slightly, but not too much.
  * I plan to eventually switch to a custom WASM library, so this will probably be less of an issue in the future.
- this is not a sample-based profiler
- this only rpeorts API calls and `dofile`/`dofile_once`, its not a full Lua profiler and probably won't be.
- even if this profiler was accurate and this tool was made in a faster language than JS, the performance will still differ from Noita, because the game has to run the entire pixel simulation engine on top of everything else, and probably a bunch of other mods.

**Library APIs:**
- `Profiler.start(mode)` starts the profiler (mode is either `"duration"` or `"counts"`)
- `Profiler.stop()` stops the profiler
- `Profiler.getFlameGraph()` returns a string of the flamegraph that can be viewed on https://speedscope.app/
- `Profiler.graph` is the raw graph

### Reflection

All reflection runs after the end of the execution. Provided file paths must have a valid supported extension.

- `--save-vfs <dir>` exports the entire virtual filesystem to a directory.
  * This will only export files that have been accessed at all during execution (read, executed or written to)
  * The output directory must be empty, and a new directory will be created if it doesn't exist
  * This will encode all virtual images into PNGs if image API is enabled
  * This safely converts all paths from VFS to the real system, and rejects any files with invalid names. As an added safety check, it will also refuse overwrite any existing files no matter what, and ensure that the output does not go outside of the target direcotry.
- `--save-vfs-log <path>` exports a log of all file changes (writes, making image editable, changing lua appends) to a file (`.txt`/`.log`/`.json`)
  * When the profiler is enabled, the log will also contain stack traces
  * The timestamp is milliseconds since the start of the emulator
- `--save-reflection <path>` exports all reflection data like spells, perks, status effects, etc (`.json`/`.yaml`)
- `--save-biome-map <path>` exports the generated biome map to a `.png` file
- `--save-misc <path>` exports some misc data like mod settings, magic numbers, persistent flags, etc (`.yaml`/`.json`)
- `--save-locale <path>` exports the final locale file (`.csv`/`.yaml`/`.json`)
- `--save-lua-globals <path>` exports all Lua globals from all contextes to `.json` or `.yaml`
  * The root contains a separate key per every context (`$vanilla` for the vanilla game, and a mod's ID per every mod)
  * Function names are placed in `$funcs` as a comma-separated string (e.g. `"$funcs": "len,byte,char,sub,rep,..."`). This is not ideal for parsing, but makes viewing the file manually much nicer.
  * Circular object references are formatted as `"<circular object>"`
  * Arrays are currently a bit broken (exported using objects with integer keys, instead of using an actual array), sorry!

`--save-reflection` does not resolve localization by default. You can use `--translate-reflection` to automatically translate all translateable text in the output; and `--locale <code>` to change the language if you want something other than English.

**Library APIs:** TBD; check the `Reflect` object

## Lua API Additions

You can test if your mod is being emulated via `ModIsEnabled("NOITA_EMULATOR")` or `ModSettingGet("NOITA_EMULATOR")`; both of which should return true. (keep in mind other mods could write to that setting, so prefer `ModIsEnabled`)

The emulator adds a global table `__emulatorSettings` with the emulator's settings (see [`src/config.ts`](./src/config.ts)).

### Working with the profiler

When the profiler is enabled, you can use `__perf_begin(label)` and `__perf_end(label)` in your mod's Lua code to report custom events that will show up in the exported graph. This keeps track of stack traces (labels started inside of another label), and collects durations/call counts.

There is also `__perf_immediate(label)`, which increments a label's call count when you're using the **call count mode** (`--prof-counts`).

> [!WARNING]
> **Make sure you always end started labels, and do not end a label without starting it!** Doing so will break the entire graph from that point forward.

**Tip:** polyfill these functions, so that you can leave them in your code even in-game! Also consider changing to PascalCase for convenience:
```lua
PerfBegin = __perf_begin or function() end
PerfEnd = __perf_end or function() end
PerfImmediate = __perf_immediate or function() end
```

## List of things that needs further testing

This might or might not lead to issues for some mods. Any help making this more accurate would be appreciated!

- Every mod gets one separate Lua context that is reused for all execution, including the vanilla game
  * `init.lua` from `data.wak` is called first in the vanilla context, then each mod's `init.lua` in that mod's own context, respecting the provided load order
  * The contextes are then kept and reused to run all hooks one by one. Hook functions are retrieved from globals.
  * Reflection (e.g. `gun_collect_metadata.lua`) creates a new separate temporary context
- Lua appends are stored as a unique set, meaning adding the same file multiple times does nothing. Order is preserved. (same for magic numbers and materials)
- The biome map & materials.xml are loaded right after `OnMagicNumbersAndWorldSeedInitialized`, after which they're constant.
- There's a lot of placeholder functions in [`src/context/lua.ts`](./src/context/lua.ts) which return blank data (`nil`, `0`, `""`, `{}`, etc) and ignore any arguments passed to them. This is used for unimplemented APIs and for some toggleable APIs (like image editing), which can lead to issues if a mod really needs accurate behavior.
- Width and height in `BiomeMapLoadImageCropped` are used for cropping, not resizing.
- `ModImageSetPixel`, `ModImageGetPixel` (and the same biome map APIs) always use 32-bit colors of format `AABBGGRR`. RGB images are converted as RGBA when loading.
- Locale is loaded strictly from `data/translations/common.csv`, the keys are hardcoded, and the file is essentially reloaded any time a mod writes to that file, so locale API calls are alwaysup to date
- Virtual File System Shenanigans
  * This emulator's VFS is probably very different from how the game actually does it, but so far I haven't encountered a single issue with it.
  * There's no concept of folders, the VFS is essentially a **KV store**. 
  * Every path is lowercased, and leading slashes are removed. (`/ExAmPlE` -> `example`)
  * `mods/{mod}/data/{path}` is always transformed to `data/{path}` - some Lua APIs report that they do that, so I simply made this apply to literally every single path.
  * Reading/writing files always returns an UTF-8 string. Doing so will permanently mark the file as "text" and cache the string; after which it cannot ever be used as an image (in e.g. image editing APIs).

## Sandbox Security

> [!CAUTION]
> **Noita Mod Emulator does not guarantee any safety for running untrusted mods.**

Noita strictly uses **Lua 5.1** compiled with **LuaJIT 2.1** for all mods, so any vulnerabilities for this Lua version also apply to Noita, and by extension, this tool. The version **cannot** be updated unless the Noita's developers decide to.

This emulator currently does not impose any memory/CPU usage limits or timeouts on the Lua sandbox either. If you want to run random untrusted mods (e.g. all the mods from Steam workshop), it is highly recommended to run this in an isolated container.

Only these libraries are exposed by default: `base`, `string`, `table`, `math`, `utf8`, `bit`, and the custom recreation of Noita's API. If you run mods with the `--unsafe-api` flag, this adds `debug`, `io`, `os` and `package`.

I plan to switch to a WASM version of the `lua-state` library in the future, so that will probably improve some things.

Please do report any vulnerabilities you discover, though, I will try my best to fix them!

