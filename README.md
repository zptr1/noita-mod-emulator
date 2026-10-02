# Noita Mod Emulator

**Noita Mod Emulator** runs Noita mods in LuaJIT using a recreation of Noita's API.

You can use this tool to

- debug & test your mods locally
- generate flame graphs

## Install

For now, you have to clone this repo.

You need to have LuaJIT installed on your system.

`bun` is recommended for running ,

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

## Assumptions

These are untested assumptions that might or might not lead to issues.

- All execution respects load order. `init.lua` from `data.wak` is called first, then all the other mods one by one. Same applies to hooks and other things.
- Lua appends are stored as a unique set, meaning adding the same file multiple times does nothing. Order is preserved. (same for magic numbers and materials)
- The biome map & materials.xml are loaded right after `OnMagicNumbersAndWorldSeedInitialized`, after which they're constant.
- Reading/writing files always returns an UTF-8 string. Doing so will cache the string in memory and mark the file as "text"; after this you cannot use image editing APIs because they require binary files.
- There's a lot of placeholder functions in [`src/context/lua.ts`](./src/context/lua.ts) which return blank data (`nil`, `0`, `""`, `{}`, etc) and ignore any arguments passed to them. This is used for unimplemented APIs and for some toggleable APIs (like image editing), which can lead to issues if a mod really needs accurate behavior.
- Width and height in `BiomeMapLoadImageCropped` are used for cropping, not resizing.
- `ModImageSetPixel`, `ModImageGetPixel` (and the same biome map APIs) always use 32-bit colors of format `AABBGGRR`. RGB images are converted as RGBA when loading.
