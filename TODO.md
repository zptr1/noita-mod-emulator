## TODO

feature creep yay

(half of this is just random ideas idk if ill do any of this)

- Reflection
  * Enemy reflection
  * Other custom content that I can't think of right now (and that might be conflicting)
  * Biome configs
  * Does `settings.lua` give anything useful?
- Entity and Component API
- More CLI stuff
  * Lua REPL?
  * If not, `--dofile` and `--hook` args?
  * Pass custom mod settings and other persistent data
    - Maybe an option to grab settings & other data from the user's actual save?
- GUI Emulation
  - Most likely using node-raylib? Although a minimal DOM viewer could be easier for me lol
  - Most mods use `OnWorldPreUpdate`/`OnWorldPostUpdate`. The CLI could have an argument to keep running world updates every frame, and spawn a window if any GUI is being done.
    * Some mods can also have an entity with a `LuaComponent` that runs a script every frame; this might be done later if I ever emulate entities.
  - The CLI should let you specify a single file to run every frame instead of world updates, optionally with a function name.
- Test assumptions and other bullshit. I do wish we had better documentation of what each API function does and how it works...
- Specify locale different than English for locale APIs
- Worldgen (hell nah)
- ~~Consider switching to `wasmoon`~~ wasmoon wasn't it, didn't support needed stuff (such as multi-value returns), but i'm still considering maybe making my own wasm thing using emscripten?
  * Greatly reduces FFI latency, making profiling a lot more accurate, at the cost of slightly slower lua (surely that's acceptable?)
  * Much easier to install
  * Can allow this to be used in web environments (very needed for another noita project of mine)
- Would be very helpful for mod devs to have more warnings/errors that catch common errors
  * Besides that, a sort of a "best practices" mode that also warns on bad stuff?
  * It might be useful to add linter settings that let you customize exactly what you want to get errors for/how strict you want the linter to be.
  * Or maybe move these to a separate CLI command `lint`?

## TOWARN

It would be nice to add more warnings that catch common errors.

- scale_y on GuiImage is 0 by default, always need to specify
- frame-spammed GuiCreate is wrong, it must be created only once and then kept in globals or smth
