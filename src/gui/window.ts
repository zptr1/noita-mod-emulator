import { GUI_DEFAULT_HEIGHT, GUI_DEFAULT_SCALE, GUI_DEFAULT_WIDTH } from "../const";

export const scale = GUI_DEFAULT_SCALE;

export let width = 0;
export let height = 0;

export let scaledWidth = 0;
export let scaledHeight = 0;

export function resizeWindow(w: number, h: number) {
  width = w;
  height = h;
  scaledWidth = w / scale;
  scaledHeight = h / scale;
}

export function pos2gui(x: number, y: number, scale=true) {
  if (!scale) return [x, y];

  return [
    Math.trunc(x) * scaledWidth * 0.01,
    Math.trunc(y) * scaledHeight * 0.01,
  ];
}

resizeWindow(GUI_DEFAULT_WIDTH, GUI_DEFAULT_HEIGHT);
