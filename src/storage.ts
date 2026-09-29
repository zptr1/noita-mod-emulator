import { DEFAULT_GLOBALS, DEFAULT_SESSION_NUMBERS, MY_NAME } from "./const";

export const STATS = {
  setPixelCalls: 0,
  getPixelCalls: 0,
};

export const SETTINGS = new Map<string, any>().set(MY_NAME, true);
export const SETTING_KEYS = [MY_NAME];

export const LOCALE = new Map<string | symbol, string>();

export const PERSISTENT_FLAGS = new Set().add(MY_NAME);
export const GAME_FLAGS = new Set().add(MY_NAME);
export const GLOBALS = new Map<string, any>(Object.entries(DEFAULT_GLOBALS));
export const NUMBER_VALUES = new Map<string, number>();
export const INT_VALUES = new Map<string, number>();
export const BOOL_VALUES = new Map<string, boolean>();

export const MAGIC_NUMBERS = new Map<string, any>();
export const SESSION_NUMBERS = new Map<string, string>(Object.entries(DEFAULT_SESSION_NUMBERS));

export const LUA_APPENDS = new Map<string, Set<string>>();
