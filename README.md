# Noita Mod Emulator

hi

i will delete/tidy up all this late r

good job reading the commit history

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
  - Probably won't emulate how the mod actually does it? At least not for now.
  - The way mods do it (iirc) is summon an entity with a LuaComponent that runs every frame, and that component does its gui things.
    * Some mods also use OnWorldPreUpdate/OnWorldPostUpdate
  - The CLI could let you specify a single file to run every frame, optionally with a function since LuaComponent lets you do that.
- [ ] Audio Banks
- [ ] Test stuff more thoroughly (check TODOs). I do wish we had better documentation of what each API function does and how it works...
- [ ] Worldgen (hell nah)
- [ ] Should I add sandboxing for settings.lua? It does not have most of the APIs. My assumption is that I shouldn't bother because why would a mod even try to use these APIs when they do not work in game.
- [ ] Ability to specify custom locale for the translation functions
