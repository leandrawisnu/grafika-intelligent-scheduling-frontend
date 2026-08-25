/** Convert oklch/oklab/color(srgb) so canvas 2D (and code-to-figma) can paint fills. */

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function srgbEncode(x: number) {
  const y = clamp01(x);
  return y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055;
}

function oklchToSrgb(L: number, C: number, hDeg: number) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return {
    r: srgbEncode(r),
    g: srgbEncode(g),
    b: srgbEncode(bl),
  };
}

function parseAlpha(raw?: string) {
  if (!raw) return 1;
  return raw.includes("%") ? parseFloat(raw) / 100 : parseFloat(raw);
}

function parseLightness(raw: string) {
  const n = parseFloat(raw);
  return raw.includes("%") ? n / 100 : n;
}

export function cssColorToRgb(input: string): string | null {
  const t = input.trim();

  let m = t.match(
    /^oklch\(\s*([0-9.]+%?)\s*,?\s*([0-9.]+)\s*,?\s*(-?[0-9.]+)(?:deg)?(?:\s*\/\s*([0-9.]+%?))?\s*\)$/i
  );
  if (m) {
    const { r, g, b } = oklchToSrgb(parseLightness(m[1]), parseFloat(m[2]), parseFloat(m[3]));
    const a = parseAlpha(m[4]);
    return a < 1
      ? `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`
      : `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  }

  m = t.match(
    /^color\(\s*srgb\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)$/i
  );
  if (m) {
    const r = Math.round(parseFloat(m[1]) * 255);
    const g = Math.round(parseFloat(m[2]) * 255);
    const b = Math.round(parseFloat(m[3]) * 255);
    const a = parseAlpha(m[4]);
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  }

  return null;
}

export function installOklchCanvasPolyfill() {
  if (typeof window === "undefined") return;
  const proto = CanvasRenderingContext2D.prototype as CanvasRenderingContext2D & {
    __gisOklchPatched?: boolean;
  };
  if (proto.__gisOklchPatched) return;

  const desc = Object.getOwnPropertyDescriptor(proto, "fillStyle");
  if (!desc?.set || !desc.get) return;

  const origSet = desc.set;
  const origGet = desc.get;
  Object.defineProperty(proto, "fillStyle", {
    configurable: true,
    get() {
      return origGet.call(this);
    },
    set(value: string | CanvasGradient | CanvasPattern) {
      if (typeof value === "string") {
        origSet.call(this, cssColorToRgb(value) ?? value);
        return;
      }
      origSet.call(this, value);
    },
  });
  proto.__gisOklchPatched = true;
}
