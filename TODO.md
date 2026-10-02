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
  * [ ] REPL?
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
- [ ] ~~Consider switching to `wasmoon`~~ wasmoon wasn't it, didn't support needed stuff (such as multi-value returns), but i'm still considering maybe making my own wasm thing using emscripten?
  * JS<->WASM is much faster than JS<->C++ FFI
  * Might be slightly slower on the lua side, but WASM can get very close to native speed
  * Can be easier to install
  * Can allow this to be used in web environments (very needed for another noita project of mine)
