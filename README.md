# Noita Mod Emulator

hi

i will delete/tidy up all this late r

good job reading the commit history

## Assumptions

These are untested assumptions that might or might not lead to issues.

- The biome map & materials.xml are loaded right after `OnMagicNumbersAndWorldSeedInitialized`.
- Lua appends are stored as a unique set, meaning adding the same file multiple times does nothing. Order is preserved.
- Reading/writing files always returns an UTF-8 string. Doing so will cache the string in memory and mark the file as "text"; after this you cannot use image editing APIs because they require binary files.
- There's a lot of placeholder functions in `src/context/placeholders.ts` which return blank data (`nil`, `0`, `""`, `{}`, etc) and ignore any arguments passed to them. This is used for unimplemented APIs and for some toggleable APIs (like image editing), which can lead to issues if a mod really needs accurate behavior.
- Width and height in `BiomeMapLoadImageCropped` are used for cropping, not resizing.
- `ModImageSetPixel`, `ModImageGetPixel` (and the same biome map APIs) always use 32-bit colors of format `AABBGGRR`. RGB images are converted into RGBA.
- ... TBD

## TODO

feature creep yay

(half of this is just random ideas idk if ill do any of this)

- [ ] Reflection
  * [ ] Finish existing reflection (spells, perks, status effects)
  * [ ] Enemy reflection
  * [ ] Other custom content
  * [ ] Collect much more info about what each mod does and changes. Not fully sure what would that be yet though
  * [ ] Export all the info to uhh maybe YAML?
  * [ ] HTML geneartion for neat viewing
  * [ ] Maybe a mod file browser could be good too? Inspecting every single change that occurred from every mod, and the final file tree, including appends.
  * [ ] Biome configs
  * [ ] Mod settings?
- [ ] Whatever that API func was called that does something with material files? I'm pretty sure I marked a function like that as a placeholder.. Would be good to emulate.
- [ ] Entity and Component API
- [ ] Good CLI
  * [ ] Run any listed mod(s)
    * meaning settings.lua, then init.lua, then all the hooks in order
    * you should be able to tell it to stop at a specific point, since a lot of reflection is available much earlier than the later initialization stages
  * [ ] Invoke any specific file and any specific function from it
  * [ ] Export reflection data to different formats
  * [ ] Pass custom mod settings and other persistent data; also world seed
    - Maybe grab settings from the game? The format is easy to parse.
- [ ] GUI Emulation
  - Maybe using node-raylib. Seems the simplest, and works well with the frame system
  - Most mods use `OnWorldPreUpdate`/`OnWorldPostUpdate`. The CLI could have an argument to keep running world updates every frame, and spawn a window if any GUI is being done.
  - Some mods can also have an entity with a `LuaComponent` that runs a script every frame; this might be done later if I ever emulate entities.
  - The CLI could also let you specify a single file to run every frame instead of world updates, optionally with a function.
- [ ] Audio Banks
- [ ] Test assumptions and other bullshit. I do wish we had better documentation of what each API function does and how it works...
- [ ] Worldgen (hell nah)
- [ ] Should I add sandboxing for settings.lua? It does not have most of the APIs. My assumption is that I shouldn't bother because why would a mod even try to use these APIs when they do not work in game.
- [ ] Ability to specify custom locale for the translation functions
