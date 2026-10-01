import { DEFAULT_GLOBALS, DEFAULT_SESSION_NUMBERS, EMULATOR } from "./const";

export const SETTINGS = new Map<string, any>().set(EMULATOR, true);
export const SETTING_KEYS: string[] = [EMULATOR];

export const LOCALE = new Map<string | symbol, string>();

export const PERSISTENT_FLAGS = new Set();
export const GAME_FLAGS = new Set();
export const GLOBALS = new Map<string, any>(Object.entries(DEFAULT_GLOBALS));
export const NUMBER_VALUES = new Map<string, number>();
export const INT_VALUES = new Map<string, number>();
export const BOOL_VALUES = new Map<string, boolean>();

export const MAGIC_NUMBERS = new Map<string, any>();
export const SESSION_NUMBERS = new Map<string, string>(Object.entries(DEFAULT_SESSION_NUMBERS));

export const LUA_APPENDS = new Map<string, Set<string>>();
