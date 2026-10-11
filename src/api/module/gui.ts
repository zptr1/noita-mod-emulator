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

export const GuiCreate = () => ({ id: new GUI().id });
export const GuiDestroy = (gid:G) => getGui(gid).destroy();
export const GuiStartFrame = (gid:G) => getGui(gid).startFrame();

export function GuiOptionsAdd(gid:G, option: number) {
  getGui(gid).options.add(option);
}

export function GuiOptionsRemove(gid:G, option: number) {
  getGui(gid).options.delete(option);
}

export function GuiOptionsClear(gid:G) {
  getGui(gid).options.clear();
}

export function GuiOptionsAddForNextWidget(gid:G, option: number) {
  getGui(gid).nextOptions.add(option);
}

export function GuiColorSetForNextWidget(gid:G, r: number, g: number, b: number, a: number) {
  getGui(gid).nextColor = [r, g, b, a];
}

export function GuiZSet(gid:G, z: number) {
  getGui(gid).zIndex = z;
}

export function GuiZSetForNextWidget(gid:G, z: number) {
  getGui(gid).nextZIndex = z;
}

export const GuiIdPush = (gid:G, id: number) => getGui(gid).pushId(id);
export const GuiIdPushString = (gid:G, str: string) => getGui(gid).pushId(str);
export const GuiIdPop = (gid:G) => getGui(gid).popId();

export function GuiAnimateBegin(gid:G) {}
export function GuiAnimateEnd(gid:G) {}
export function GuiAnimateAlphaFadeIn(gid:G, id: number, speed: number, step: number, reset: boolean) {}
export function GuiAnimateScaleIn(gid:G, id: number, acceleration: number, reset: boolean) {}
export function GuiText(gid:G, x: number, y: number, text: string, scale = 1, font = "", font_is_pixel_font = true) {}
export function GuiTextCentered(gid:G, x: number, y: number, text: string) {}

export function GuiImage(
  gid:G, id: number, x: number, y: number, sprite_filename: string,
  alpha = 0, scale = 1, scale_y = 0, rotation = 0,
  rect_animation_playback_type = GUI_RECT_ANIMATION_PLAYBACK.PlayToEndAndHide,
  rect_animation_name = ""
) {}

export function GuiImageNinePiece(
  gid:G, id: number, x: number, y: number, width: number, height: number, alpha = 1,
  sprite_filename="data/ui_gfx/decorations/9piece0_gray.png",
  sprite_highlight_filename="data/ui_gfx/decorations/9piece0_gray.png"
) {}

export function GuiButton(
  gid:G, id: number, x: number, y: number | string, text: number | string,
  scale=1, font="", font_is_pixel_font=true
) {
  if (typeof y == "number") {
    // id, x, y, text
  } else {
    // x, y, text, id
  }
}

export function GuiImageButton(gid:G, id: number, x: number, y: number, text: string, sprite_filename: string) {}

export function GuiSlider(
  gid:G, id: number, x: number, y: number, text: string,
  value: number, value_min: number, value_max: number, value_default: number,
  value_display_multiplier: number, value_formatting: string,
  width: number
) {}

export function GuiTextInput(
  gid:G, id: number, x: number, y: number, text: string, width: number,
  max_length: number, allowed_characters=""
) {}

export function GuiBeginAutoBox(gid:G) {}

export function GuiEndAutoBoxNinePiece(
  gid:G, margin=5, size_min_x=0, size_min_y=0,
  mirrorize_over_x_axis=false, x_axis=0,
  sprite_filename="data/ui_gfx/decorations/9piece0_gray.png",
  sprite_highlight_filename="data/ui_gfx/decorations/9piece0_gray.png"
) {}

export function GuiTooltip(gid:G, text: String, description: string) {}

export function GuiBeginScrollContainer(
  gid:G, id: number, x: number, y: number, width: number, height: number,
  scrollbar_gamepad_focusable=true, margin_x=2, margin_y=2
) {}

export function GuiEndScrollContainer(gid:G) {}

export function GuiLayoutBeginHorizontal(
  gid:G, x: number, y: number, position_in_ui_scale=false, margin_x=2, margin_y=2
) {}

export function GuiLayoutBeginVertical(
  gid:G, x: number, y: number, position_in_ui_scale=false, margin_x=0, margin_y=0
) {}

export function GuiLayoutAddHorizontalSpacing(gid:G, amount?: number) {}
export function GuiLayoutAddVerticalSpacing(gid:G, amount?: number) {}
export function GuiLayoutEnd(gid:G) {}
export function GuiLayoutBeginLayer(gid:G) {}
export function GuiLayoutEndLayer(gid:G) {}

export function GuiGetScreenDimensions(gid:G) {
  return pos2gui(width, height); // ?
}

export function GuiGetTextDimensions(
  gid:G, text: string, scale=1, line_spacing=2, font="", font_is_pixel_font=true
) {}

export function GuiGetImageDimensions(gid:G, image_filename: string, scale=1) {}

export function GuiGetPreviousWidgetInfo(gid:G) {}
