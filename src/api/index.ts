import * as Script from "./script";
import * as Data from "./data";
import * as Util from "./util";

export * as Image from "./module/img";
export * as PRNG from "./module/prng";
export * as GUI from "./module/gui";

export const Base = {
  ...Script,
  ...Data,
  ...Util
};
