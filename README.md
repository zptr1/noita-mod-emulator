# Noita Mod Emulator

Run and debug Noita mods programmatically outside of the game.

This tool runs mods via LuaJIT, providing an emulated API.

You can use this tool to

- debug & test your mods locally
- generate flame graphs
- export data from mods (spells, perks, status effects, etc)

## Install

You need to have LuaJIT installed on your system including its development headers and libraries. You also need development tools (`node-gyp`, `gcc`, ...).

Noita uses **Lua 5.1** compiled with **LuaJIT 2.1** for mods. This emulator requires the same version, or some mods will be broken. This tool will try to install with the correct Lua version, but if you still have the wrong version, try running [`scripts/build-lua.mjs`](./scripts/build-lua.mjs); it'll try to install the right one.

TODO: should i just publish the package?

## CLI

TBD

## Lua API

The emulator adds a global table `__emulatorSettings` with the emulator's settings (see [`src/config.ts`](./src/config.ts)).

When profiler is enabled, `__perf_begin(label)` and `__perf_end(label)` can be used to report performance. This keeps track of stack traces, runtimes and total call counts for every label.

You can test if your mod is being emulated by checking if `NOITA_EMULATOR` is an enabled mod or a setting, for example:
```lua
if not ModIsEnabled("NOITA_EMULATOR") then
  function __perf_begin() end
  function __perf_end() end
end
```

## List of things that needs further testing

This might or might not lead to issues for some mods. Any help making this more accurate would be appreciated!

- Every mod gets one separate Lua context that is reused for all execution, including the vanilla game
  * `init.lua` from `data.wak` is called first in the vanilla context, then each mod's `init.lua` in that mod's own context, respecting the provided load order
  * The contextes are then kept and reused to run all hooks one by one. Hook functions are retrieved from globals.
  * Reflection (e.g. `gun_collect_metadata.lua`) creates a separate context
- Lua appends are stored as a unique set, meaning adding the same file multiple times does nothing. Order is preserved. (same for magic numbers and materials)
- The biome map & materials.xml are loaded right after `OnMagicNumbersAndWorldSeedInitialized`, after which they're constant.
- Reading/writing files always returns an UTF-8 string. Doing so will cache the string in memory and mark the file as "text"; after this you cannot use image editing APIs because they require binary files.
- There's a lot of placeholder functions in [`src/context/lua.ts`](./src/context/lua.ts) which return blank data (`nil`, `0`, `""`, `{}`, etc) and ignore any arguments passed to them. This is used for unimplemented APIs and for some toggleable APIs (like image editing), which can lead to issues if a mod really needs accurate behavior.
- Width and height in `BiomeMapLoadImageCropped` are used for cropping, not resizing.
- `ModImageSetPixel`, `ModImageGetPixel` (and the same biome map APIs) always use 32-bit colors of format `AABBGGRR`. RGB images are converted as RGBA when loading.
- There's no concept of folders in the virtual file system, you can literally make a file using a bunch of slashes as the name, or write to a location that already contains files. Every path is lowercased, and then transformed like this:
  * `/{path}` -> `{path}`
  * `mods/{mod}/data/{path}` -> `data/{patrh}`
