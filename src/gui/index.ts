import { initRl, renderRl } from "./raylib";
import { LUA_HOOKS } from "../const";
import { printLog } from "../log";
import { runHook } from "../vm";

export * from "./gui";
export * from "./raylib";
export * from "./window";

export function startRenderLoop() {
  let playerSpawned = "OnPlayerSpawned" as any;
  if (!LUA_HOOKS.includes(playerSpawned)) {
    runHook(playerSpawned, 0);
  }

  initRl();
  printLog("GUI", "Starting a render loop");

  while (true) {
    if (!renderRl()) break;
    runHook("OnWorldPreUpdate");
    runHook("OnWorldPostUpdate");
  }

  printLog("GUI", "Window closed");
}
