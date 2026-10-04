const _b = Buffer.alloc(6);
const _t = new TextEncoder();

export function FNV1a(buf: Uint8Array, seed=0x811c9dc5) {
  for (let i = 0; i < buf.length; i++) {
    seed = Math.imul(seed ^ buf[i], 16777619);
  }
  return seed >>> 0;
}

export function hashStrFNV1a(str: string, seed?: number) {
  return FNV1a(_t.encode(str), seed);
}

export function hashIntFNV1a(int: number, seed?: number) {
  _b.writeIntLE(int, 0, 6);
  return FNV1a(_b, seed);
}
