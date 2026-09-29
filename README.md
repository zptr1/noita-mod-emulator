# Noita Mod Emulator

hi

## TODO

- [ ] Reflection
  * [ ] Finish existing reflection (spells, perks, status effects)
  * [ ] Enemy reflection
  * [ ] Other custom content
  * [ ] Collect much more info about what each mod does and changes. Not fully sure what would that be yet though
  * [ ] Export all the info to uhh maybe YAML?
  * [ ] HTML geneartion for neat viewing
  * [ ] Maybe a mod file browser could be good too? Inspecting every single change that occurred from every mod, and the final file tree, including appends.
  * [ ] Biome configs
- [ ] Whatever that API func was called that does something with material files? I'm pretty sure I marked a function like that as a placeholder.. Would be good to emulate.
- [ ] Entity and Component API
- [ ] Good CLI
  * [ ] Run any listed mod(s)
  * [ ] Invoke any specific file and any specific function from it
  * [ ] Export reflection data to different formats
  * [ ] Generate 
  * [ ] Pass custom mod settings and other persistent data
    - Maybe grab settings from the game? The format is easy to parse.
- [ ] GUI Emulation
  - Maybe using node-raylib. Seems the simplest, and works well with the frame system
  - Probably won't emulate how the mod actually does it? At least not for now.
  - The way mods do it (iirc) is summon an entity with a LuaComponent that runs every frame, and that component does its gui things.
  - The CLI could let you 
- [ ] Audio Banks
- [ ] Test stuff more thoroughly (check TODOs). I do wish we had better documentation of what each API function does and how it works...
