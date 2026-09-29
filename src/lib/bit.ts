// Polyfill for the `bit` library, which is, for some reason, missing from lua-state
// This is a bit shitty but I honestly don't care

export const luaBitLib = {
  band: (a: number, b: number) => a & b,
  bor: (a: number, b: number) => a | b,
  bxor: (a: number, b: number) => a ^ b,
  bnot: (a: number) => ~a,
  lshift: (a: number, b: number) => a << (b & 31),
  rshift: (a: number, b: number) => a >>> (b & 31),
  arshift: (a: number, b: number) => a >> (b & 31),
  rol: (a: number, b: number) => (a << (b & 31)) | (a >>> ((32 - b) & 31)),
  ror: (a: number, b: number) => (a >>> (b & 31)) | (a << ((32 - b) & 31)),
  bswap: (a: number) =>
    ((a & 0xff) << 24) |
    ((a & 0xff00) << 8) |
    ((a >> 8) & 0xff00) |
    ((a >> 24) & 0xff),
  tobit: (a: number) => a | 0,
  tohex: (a: number, n?: number) => {
    const len = n != undefined ? (n < 0 ? -n : n) : 8;
    let hex = (a >>> 0).toString(16);
    if (hex.length < len) hex = "0".repeat(len - hex.length) + hex;
    else if (hex.length > len) hex = hex.slice(hex.length - len);
    return n != undefined && n < 0 ? hex.toUpperCase() : hex;
  }
};
