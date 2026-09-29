// Credits to https://github.com/Lymm37/noita-telescope

const _buf = new ArrayBuffer(8);
const _dv = new DataView(_buf);

const f2i = (val: number) => {
  _dv.setFloat64(0, val, true);
  return _dv.getBigUint64(0, true);
}

const i2f = (val: bigint) => {
  _dv.setBigUint64(0, val, true);
  return _dv.getFloat64(0, true);
}

function mix(a: number, b: number, ws: number) {
  a >>>= 0; b >>>= 0; ws >>>= 0;
  let u2 = ((a - b) - ws) ^ (ws >>> 13); u2 >>>= 0;
  let u1 = ((b - u2) - ws) ^ (u2 << 8); u1 >>>= 0;
  let u3 = ((ws - u2) - u1) ^ (u1 >>> 13); u3 >>>= 0;
  u2 = ((u2 - u1) - u3) ^ (u3 >>> 12); u2 >>>= 0;
  u1 = ((u1 - u2) - u3) ^ (u2 << 16); u1 >>>= 0;
  u3 = ((u3 - u2) - u1) ^ (u1 >>> 5); u3 >>>= 0;
  u2 = ((u2 - u1) - u3) ^ (u3 >>> 3); u2 >>>= 0;
  u1 = ((u1 - u2) - u3) ^ (u2 << 10); u1 >>>= 0;
  return (((u3 - u2) - u1) ^ (u1 >>> 15)) >>> 0;
}

export class NollaPrng {
  public seed: number = 0;

  SetRandomSeed(ws: number, x: number, y: number) {
    let a = (ws ^ 0x93262e6f) >>> 0;
    let b = a & 0xfff;
    let c = (a >>> 12) & 0xfff;
    let x_ = x + b;
    let y_ = y + c;
    let r = x_ * 134217727.0;
    let e = (r & 0xffffffff) >>> 0;

    let _x = f2i(x_) & 0x7fffffffffffffffn;
    let _y = f2i(y_) & 0x7fffffffffffffffn;

    if (i2f(_y) >= 102400.0 || i2f(_x) <= 1.0) {
      r = y_ * 134217727.0;
    } else {
      let y__ = y_ * 3483.328;
      y__ += e;
      y_ *= y__;
      r = y_;
    }

    let f = r ? (r & 0xffffffff) >>> 0 : 2; 
    let g = mix(e, f, ws);
    let s = g;
    s /= 4294967295.0;
    s *= 2147483639.0;
    s += 1.0;
    this.seed = s >>> 0;
    this.Next();

    let h = ws & 3;
    while (h > 0) {
      this.Next();
      h--;
    }
  }

  Next() {
    let s = BigInt(Math.floor(this.seed));
    let v4 = 16807n * s - 2147483647n * (s / 127773n);
    if (v4 <= 0n) v4 += 2147483647n;
    this.seed = Number(v4);
    return this.seed / 2147483647.0;
  }

  Prev() {
    let s = BigInt(Math.floor(this.seed));
    let v4 = (1407677000n * s) % 2147483647n;
    if (v4 <= 0n) v4 += 2147483647n;
    this.seed = Number(v4);
    return this.seed / 2147483647.0;
  }

  NextU() {
    this.Next();
    let r = this.seed * 4.656612875e-10 * 2147483645.0;
    return r >>> 0;
  }

  Random(a: number, b: number) {
    return a + Math.floor((b + 1 - a) * this.Next());
  }

  getDistribution(mean: number, sharpness: number, baseline: number) {
    let i = 0;
    let pi = 3.1415;

    while (i < 100) {
      let r1 = this.Next();
      let r2 = this.Next();
      let div = Math.abs(r1 - mean);
      if (r2 < (1.0 - div) * baseline) {
        return r1;
      }
      if (div < 0.5) {
        let v11 = Math.sin(((0.5 - mean) + r1) * pi);
        let v12 = Math.pow(v11, sharpness);
        if (v12 > r2) {
          return r1;
        }
      }
      i++;
    }

    return this.Next();
  }

  RandomDistribution(min: number, max: number, mean: number, sharpness: number, baseline: number) {
    if (sharpness == 0) return this.Random(min, max);
    let adjMean = (mean - min)/(max - min);
    let v7 = this.getDistribution(adjMean, sharpness, baseline);
    let d = Math.round(v7 * (max - min));
    return min + d;
  }

  RandomDistributionF(min: number, max: number, mean: number, sharpness: number, baseline: number) {
    if (sharpness == 0) return min + (max - min) * this.Next();
    let adjMean = (mean - min)/(max - min);
    let v7 = this.getDistribution(adjMean, sharpness, baseline);
    return min + v7 * (max - min);
  }
}
