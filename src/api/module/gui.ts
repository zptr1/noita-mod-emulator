import { GUI, guis, height, pos2gui, width } from "../../gui";
import { GUI_RECT_ANIMATION_PLAYBACK } from "../../lib/nolla_const";
import { printWarn } from "../../log";

type G = { id: number };
const getGui = (obj: G) => {
  if (typeof obj != "object" || typeof obj.id != "number") {
    throw new Error(`Invalid GUI ID: ${obj}`);
  }

  const gui = guis.get(obj.id);
  if (!gui) throw new Error(`Unknown GUI: ${obj.id}`);

  return gui;
};

export function GuiCreate(): G {
  const gui = new GUI();
  return { id: gui.id };
}

export function GuiDestroy(gui: G) {
  getGui(gui).destroy();
}

export function GuiStartFrame(gui: G) {
  const g = getGui(gui);

  if (g.hashStack.length > 0) {
    printWarn("GUI", `GuiIdPop() wasn't called enough times! (${g.hashStack.length} pushes remained to the next frame)`);
    g.hashStack.length = 0;
    g.hash = undefined;
  }
}

export function GuiOptionsAdd(gui: G, option: number) {}
export function GuiOptionsRemove(gui: G, option: number) {}
export function GuiOptionsClear(gui: G) {}
export function GuiOptionsAddForNextWidget(gui: G, option: number) {}
export function GuiColorSetForNextWidget(gui: G, r: number, g: number, b: number, a: number) {}
export function GuiZSet(gui: G, z: number) {}
export function GuiZSetForNextWidget(gui: G, z: number) {}

export const GuiIdPush = (gui: G, id: number) => getGui(gui).pushId(id);
export const GuiIdPushString = (gui: G, str: string) => getGui(gui).pushId(str);
export const GuiIdPop = (gui: G) => getGui(gui).popId();

export function GuiAnimateBegin(gui: G) {}
export function GuiAnimateEnd(gui: G) {}
export function GuiAnimateAlphaFadeIn(gui: G, id: number, speed: number, step: number, reset: boolean) {}
export function GuiAnimateScaleIn(gui: G, id: number, acceleration: number, reset: boolean) {}
export function GuiText(gui: G, x: number, y: number, text: string, scale = 1, font = "", font_is_pixel_font = true) {}
export function GuiTextCentered(gui: G, x: number, y: number, text: string) {}

export function GuiImage(
  gui: G, id: number, x: number, y: number, sprite_filename: string,
  alpha = 0, scale = 1, scale_y = 0, rotation = 0,
  rect_animation_playback_type = GUI_RECT_ANIMATION_PLAYBACK.PlayToEndAndHide,
  rect_animation_name = ""
) {}

export function GuiImageNinePiece(
  gui: G, id: number, x: number, y: number, width: number, height: number, alpha = 1,
  sprite_filename="data/ui_gfx/decorations/9piece0_gray.png",
  sprite_highlight_filename="data/ui_gfx/decorations/9piece0_gray.png"
) {}

export function GuiButton(
  gui: G, id: number, x: number, y: number | string, text: number | string,
  scale=1, font="", font_is_pixel_font=true
) {
  if (typeof y == "number") {
    // id, x, y, text
  } else {
    // x, y, text, id
  }
}

export function GuiImageButton(gui: G, id: number, x: number, y: number, text: string, sprite_filename: string) {}

export function GuiSlider(
  gui: G, id: number, x: number, y: number, text: string,
  value: number, value_min: number, value_max: number, value_default: number,
  value_display_multiplier: number, value_formatting: string,
  width: number
) {}

export function GuiTextInput(
  gui: G, id: number, x: number, y: number, text: string, width: number,
  max_length: number, allowed_characters=""
) {}

export function GuiBeginAutoBox(gui: G) {}

export function GuiEndAutoBoxNinePiece(
  gui: G, margin=5, size_min_x=0, size_min_y=0,
  mirrorize_over_x_axis=false, x_axis=0,
  sprite_filename="data/ui_gfx/decorations/9piece0_gray.png",
  sprite_highlight_filename="data/ui_gfx/decorations/9piece0_gray.png"
) {}

export function GuiTooltip(gui: G, text: String, description: string) {}

export function GuiBeginScrollContainer(
  gui: G, id: number, x: number, y: number, width: number, height: number,
  scrollbar_gamepad_focusable=true, margin_x=2, margin_y=2
) {}

export function GuiEndScrollContainer(gui: G) {}

export function GuiLayoutBeginHorizontal(
  gui: G, x: number, y: number, position_in_ui_scale=false, margin_x=2, margin_y=2
) {}

export function GuiLayoutBeginVertical(
  gui: G, x: number, y: number, position_in_ui_scale=false, margin_x=0, margin_y=0
) {}

export function GuiLayoutAddHorizontalSpacing(gui: G, amount?: number) {}
export function GuiLayoutAddVerticalSpacing(gui: G, amount?: number) {}
export function GuiLayoutEnd(gui: G) {}
export function GuiLayoutBeginLayer(gui: G) {}
export function GuiLayoutEndLayer(gui: G) {}

export function GuiGetScreenDimensions(gui: G) {
  return pos2gui(width, height); // ?
}

export function GuiGetTextDimensions(
  gui: G, text: string, scale=1, line_spacing=2, font="", font_is_pixel_font=true
) {}

export function GuiGetImageDimensions(gui: G, image_filename: string, scale=1) {}

export function GuiGetPreviousWidgetInfo(gui: G) {}
