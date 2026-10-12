# Changelog

## [0.0.2] - 2026-10-12

- Added a REPL (`noita-emu repl`)
- Added `--save-wak` for generating a .wak archive of the current VFS
  * Running `noita-emu --save-wak out.wak --wak-only run` will produce an identical .wak archive as the vanilla game
- Added `--vfs-only` to avoid running any Lua and only load the VFS
- Added `--wak-only` to omit anything from the game's data folder except `data/data.wak` (also automatically enables `--vfs-only`)
- Added `--save-vfs-full` for exporting the entire VFS, including files that haven't been accessed yet
- Fixed `--save-lua-globals` not exporting arrays properly

## [0.0.1] - 2026-09-03

Initial release
