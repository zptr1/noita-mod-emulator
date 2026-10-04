import { height, width } from "./window";
import { GUI_FPS } from "../const";
import { printLog } from "../log";
import r from "raylib";

let init = false;

export function initRl() {
  if (init) return;

  r.SetTraceLogLevel(4);
  r.InitWindow(width, height, "Noita Mod Emulator");
  r.SetTargetFPS(GUI_FPS);

  printLog("GUI", "Initialized raylib");
  init = true;
}

