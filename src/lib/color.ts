/** Lightens (amt > 0) or darkens (amt < 0) a hex color by blending toward white or black. */
export function shade(hex: string, amt: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  let r = n >> 16;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const target = amt < 0 ? 0 : 255;
  const a = Math.abs(amt);
  r = Math.round(r + (target - r) * a);
  g = Math.round(g + (target - g) * a);
  b = Math.round(b + (target - b) * a);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** Blends color a toward color b by t (0 to 1). */
export function mix(a: string, b: string, t: number): string {
  const parse = (h: string) => {
    const s = h.replace('#', '');
    return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
  };
  const x = parse(a);
  const y = parse(b);
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/** Pulls any color slightly toward a warm grey, so random combinations still read as one palette. */
export const mute = (c: string): string => mix(c, '#A3928C', 0.2);

/** Escapes text for use inside SVG/HTML markup. */
export const esc = (t: string): string =>
  t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** Formats a coordinate with one decimal place. */
export const f1 = (n: number): string => n.toFixed(1);
