# Library Reference

this is not everything and i cba to document this properly. you'll have to figure shit out urself, sorry. The library does have good TypeScript types though.

## Functions
- `setConfig({ … })` changes config
- `detectMods()` detects all available mods and returns a map of `mod ID` -> `{ id, path }`
- `loadModListFromDir(dir: string)` detects all available mods from the specified directory
- `load(mods: string[])` loads the provided list of mods (either by mod ID or path)
  * `loadGame()` loads the vanilla game
  * `loadModById(id)` loads the mod by its ID
  * `loadModFromDir(path)` loads the mod from a directory
- `preHook(hook, listener)` runs the function right before the hook runs
- `postHook(hook, listener)` runs the function right after the hook finishes running
- `run()` starts execution
  * `runSettings()` runs mod settings; can only be called once. Automatically called by `run()` if it hasn't been called before
  * `runHook(hook, ...args)` can be used to run a hook manually
- `stop()` stops execution (combine with `preHook`/`postHook` to control where to stop)

## Sub-modules
- use the `Context` class to create a custom lua context and eval shit or smth
- `Reflect` has all functions for reflection
- `Profiler` is the profiler
- `VFS` is the virtual filesystem
- `API` has all APIs that can be called from Lua, and are added to a context with `Context.addAPI`.
  * functions prefixed with `$` are omitted
  * functions like `ctx$FunctionName` are instead added as `FunctionName`, and always get called with the current `Context` object (useful if the function needs to know the mod that called it)
- `constants` has all the constants used by the emulator
- `storage` has some key-value storages accessed from the APIs (mod settings, )

## Variables
- `config` is the current emulator's config
- `gameCtx` is the `Context` object used for the vanilla game (empty if `load` hasn't been called yet)
- `activeMods` is the list of active mods including their `Context` objects (use `activeModsById` for a map of ID->mod)
- `availableMods` is the list of all detected mods
