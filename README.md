# Noita Mod Emulator

hi

i will delete/tidy up all this late r

good job reading the commit history

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

- All execution respects load order. Vanilla game's `init.lua` is called first, then all the other mods one by one; same applies to hooks.
- Lua appends are stored as a unique set, meaning adding the same file multiple times does nothing. Order is preserved. (same for magic numbers and materials)
- The biome map & materials.xml are loaded right after `OnMagicNumbersAndWorldSeedInitialized`, after which they're constant.
- Reading/writing files always returns an UTF-8 string. Doing so will cache the string in memory and mark the file as "text"; after this you cannot use image editing APIs because they require binary files.
- There's a lot of placeholder functions in [`src/context/lua.ts`](./src/context/lua.ts) which return blank data (`nil`, `0`, `""`, `{}`, etc) and ignore any arguments passed to them. This is used for unimplemented APIs and for some toggleable APIs (like image editing), which can lead to issues if a mod really needs accurate behavior.
- Width and height in `BiomeMapLoadImageCropped` are used for cropping, not resizing.
- `ModImageSetPixel`, `ModImageGetPixel` (and the same biome map APIs) always use 32-bit colors of format `AABBGGRR`. RGB images are converted as RGBA when loading.

## TODO

feature creep yay

(half of this is just random ideas idk if ill do any of this)

- [ ] Reflection
  * [ ] Should be configurable so nothing happens when there's no need to
  * [ ] Finish existing reflection (spells, perks, status effects)
  * [ ] Enemy reflection
  * [ ] Other custom content
  * [ ] Collect much more info about what each mod does and changes. Not fully sure what would that be yet though
  * [ ] Export all the info to YAML, and optionally generate HTML/make a web viewer. Could have a VFS file browser as well.
  * [ ] Collect a history of all file changes
  * [ ] Biome configs
  * [ ] Mod settings?
- [ ] Entity and Component API
- [ ] CLI
  * [ ] Run any listed mod(s)
  * [ ] Invoke any specific file and any specific function from it
  * [ ] Reflection
  * [ ] Pass custom mod settings and other persistent data; also world seed
    - Maybe an option to grab settings & other data from the user's actual save?
- [ ] GUI Emulation
  - Most likely using node-raylib? Although a minimal DOM viewer could be easier for me lol
  - Most mods use `OnWorldPreUpdate`/`OnWorldPostUpdate`. The CLI could have an argument to keep running world updates every frame, and spawn a window if any GUI is being done.
    * Some mods can also have an entity with a `LuaComponent` that runs a script every frame; this might be done later if I ever emulate entities.
  - The CLI should let you specify a single file to run every frame instead of world updates, optionally with a function name.
- [ ] API/CLI for working with `data.wak` and audio banks could be a good feature for the future
  * This might be out of scope for now though, this is leaning towards the "general purpose tool for mods" direction than strictly a mod emulator.
- [ ] Test assumptions and other bullshit. I do wish we had better documentation of what each API function does and how it works...
- [ ] Worldgen (hell nah)
- [ ] Ability to specify custom locale for the translation functions
- [ ] Warning messages for engine quirks or other bugs that mods might unknowingly be doing
  * dofile/dofile_once should probably be okay to add a couple API calls to for proper error stack traces.
  * ... although that might be funny with functions/libraries exported from dofile_once
- [ ] Convert VFS path back into real path for logs/stack traces
- [ ] Consider switching to `wasmoon`
  * JS<->WASM is much faster than JS<->C++ FFI
  * Might be slightly slower on the lua side, but WASM can get very close to native speed
  * Can be easier to install
  * Can allow this to be used in web environments (very needed for another noita project of mine)
