import * as Script from "./script";
import * as PRNG from "./prng";
import * as Data from "./data";
import * as Util from "./util";

export * as Image from "./module/img";

export const Base = {
  ...Script,
  ...PRNG,
  ...Data,
  ...Util
};
