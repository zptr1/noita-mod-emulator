import { height, resizeWindow, width } from "./window";
import { GUI_FPS } from "../const";
import { printLog } from "../log";
import r from "raylib";

let init = false;

export function initRl() {
  if (init) return;

  r.SetTraceLogLevel(4);
  // r.SetConfigFlags(r.FLAG_WINDOW_RESIZABLE | r.FLAG_WINDOW_MAXIMIZED | r.FLAG_FULLSCREEN_MODE);
  r.InitWindow(width, height, "Noita Mod Emulator");
  r.SetTargetFPS(GUI_FPS);

  printLog("GUI", "Initialized raylib");
  init = true;
}

export function renderRl() {
  if (r.WindowShouldClose()) return false;

  const w = r.GetScreenWidth(), h = r.GetScreenHeight();
  if (w != width || h != height) {
    resizeWindow(w, h);
  }

  r.BeginDrawing();
  r.EndDrawing();

  return true;
}
