/*
 * Hair is built in two steps. The style (short, medium, long, bun) defines the outline,
 * and the texture (straight, wavy, curly) changes how that outline is drawn:
 * straight hair is a smooth curve, wavy hair ripples below the crown, and curly hair
 * gets a scalloped edge of small curls with a little extra volume.
 *
 * All hair is drawn in head coordinates (wrap in HEAD_TRANSFORM).
 */
import { f1, shade } from '../lib/color.ts';
import type { HairStyle, HairTexture } from '../items/types.ts';

type Pt = [number, number];

/** Points along a quadratic curve from a through control point c to b. */
function quad(a: Pt, c: Pt, b: Pt, steps = 12): Pt[] {
  const pts: Pt[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return pts;
}

/** Builds a closed outline from a start point and a list of [control, end] curve pairs. */
function outline(start: Pt, curves: Array<[Pt, Pt]>): Pt[] {
  const pts: Pt[] = [start];
  let at = start;
  for (const [c, b] of curves) {
    pts.push(...quad(at, c, b));
    at = b;
  }
  return pts.slice(0, -1); // the last curve ends back at the start
}

/** Hair behind the head for each style, as closed outlines. */
const BACK: Record<HairStyle, Pt[]> = {
  long: outline([76, 72], [[[72, 22], [110, 22]], [[148, 22], [144, 72]], [[150, 140], [152, 196]], [[110, 208], [68, 196]], [[70, 140], [76, 72]]]),
  medium: outline([76, 72], [[[72, 22], [110, 22]], [[148, 22], [144, 72]], [[148, 112], [149, 150]], [[110, 158], [71, 150]], [[72, 112], [76, 72]]]),
  short: outline([76, 72], [[[72, 22], [110, 22]], [[148, 22], [144, 72]], [[147, 98], [148, 114]], [[110, 122], [72, 114]], [[73, 98], [76, 72]]]),
  bun: outline([78, 74], [[[76, 28], [110, 28]], [[144, 28], [142, 74]], [[141, 84], [138, 90]], [[110, 94], [82, 90]], [[79, 84], [78, 74]]]),
};

/** The bun itself, drawn as its own small outline above the head. */
const BUN_KNOT = outline([93, 24], [[[93, 7], [110, 7]], [[127, 7], [127, 24]], [[127, 41], [110, 41]], [[93, 41], [93, 24]]]);

/** Bangs for each style. The bun has hair swept back instead. */
const BANGS = outline([78, 72], [[[78, 30], [110, 30]], [[142, 30], [142, 72]], [[138, 50], [124, 45]], [[106, 57], [84, 53]], [[80, 61], [78, 72]]]);
// Covers the whole crown (the face reaches y=30) with a soft hairline lower on the forehead.
const SWEPT_BACK = outline([77, 72], [[[75, 23], [110, 23]], [[145, 23], [143, 72]], [[140, 52], [126, 46]], [[110, 39], [94, 46]], [[80, 52], [77, 72]]]);

/** Resamples a closed outline so its points are about `spacing` apart. */
function resample(pts: Pt[], spacing: number): Pt[] {
  const out: Pt[] = [];
  let carry = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let d = carry;
    while (d < len) {
      const t = d / len;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      d += spacing;
    }
    carry = d - len;
  }
  return out;
}

/** Outward-facing unit normal at each point of a closed outline. */
function normals(pts: Pt[]): Pt[] {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return pts.map((p, i) => {
    const prev = pts[(i - 1 + pts.length) % pts.length];
    const next = pts[(i + 1) % pts.length];
    const tx = next[0] - prev[0];
    const ty = next[1] - prev[1];
    const len = Math.hypot(tx, ty) || 1;
    let nx = ty / len;
    let ny = -tx / len;
    if (nx * (p[0] - cx) + ny * (p[1] - cy) < 0) {
      nx = -nx;
      ny = -ny;
    }
    return [nx, ny];
  });
}

/** A smooth closed path through the points (Catmull-Rom curves converted to cubic Béziers). */
function smoothPath(pts: Pt[]): string {
  const n = pts.length;
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + ' Z';
}

/** Ripples the outline below the crown (y > startY) for wavy hair. */
function wave(pts: Pt[], amplitude: number, wavelength: number, startY: number): Pt[] {
  const dense = resample(pts, 2.5);
  const ns = normals(dense);
  let dist = 0;
  return dense.map((p, i) => {
    if (i > 0) dist += Math.hypot(p[0] - dense[i - 1][0], p[1] - dense[i - 1][1]);
    const fade = Math.min(1, Math.max(0, (p[1] - startY) / 18));
    const off = amplitude * fade * Math.sin((2 * Math.PI * dist) / wavelength);
    return [p[0] + ns[i][0] * off, p[1] + ns[i][1] * off];
  });
}

/** Spreads an outline away from its center for extra volume. */
function puff(pts: Pt[], amount: number): Pt[] {
  const ns = normals(pts);
  return pts.map((p, i) => [p[0] + ns[i][0] * amount, p[1] + ns[i][1] * amount]);
}

/**
 * Curly hair: a ring of small curls along the outline, so the edge is scalloped.
 * Every curl is outlined first, then all of them are filled on top, so only the outer
 * edge of the whole shape keeps an outline (no overlapping rings where curls meet).
 */
function curls(pts: Pt[], radius: number, stroke: string, fill: string): string {
  const ring = resample(pts, radius * 1.3);
  // Alternate the curl sizes slightly so the edge looks natural rather than stamped.
  const sized = ring.map(([x, y], i) => [x, y, radius * (i % 3 === 0 ? 1.12 : i % 3 === 1 ? 0.92 : 1)] as const);
  const circle = ([x, y, r]: readonly [number, number, number], extra: string) =>
    `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${extra}/>`;
  return (
    sized.map((c) => circle(c, `fill="none" stroke="${stroke}" stroke-width="2.6"`)).join('') +
    sized.map((c) => circle(c, `fill="${fill}"`)).join('') +
    `<path d="${smoothPath(pts)}" fill="${fill}" stroke="none"/>`
  );
}

/** Draws an outline in the given texture. */
interface TextureOptions {
  /** Waves start below this height, so the crown stays smooth. */
  waveFromY: number;
  waveSize?: number;
  waveLength?: number;
  /** Curl radius, and how far curly hair spreads beyond the outline. */
  curl: number;
  volume?: number;
}

function textured(pts: Pt[], texture: HairTexture, color: string, opts: TextureOptions): string {
  const attrs = `fill="${color}" stroke="${shade(color, -0.3)}" stroke-width="1.3" stroke-linejoin="round"`;
  if (texture === 'curly') return curls(puff(pts, opts.volume ?? 3), opts.curl, shade(color, -0.3), color);
  const shape = texture === 'wavy' ? wave(pts, opts.waveSize ?? 2.4, opts.waveLength ?? 24, opts.waveFromY) : resample(pts, 4);
  return `<path d="${smoothPath(shape)}" ${attrs}/>`;
}

/** The hair behind the head (plus the bun, for buns). */
export function hairBack(style: HairStyle, texture: HairTexture, color: string): string {
  if (style !== 'bun') return textured(BACK[style], texture, color, { waveFromY: 70, curl: 6.5 });
  // Hair pulled up into a bun sits close to the head; the texture shows mostly in the knot.
  return (
    textured(BACK.bun, texture, color, { waveFromY: 70, waveSize: 1.2, curl: 3.5, volume: 0.5 }) +
    textured(BUN_KNOT, texture, color, { waveFromY: 0, waveSize: 1.1, waveLength: 13, curl: 4.5, volume: 1.5 })
  );
}

/** Strand lines and highlights over the back hair, shaped to match the texture. */
export function hairDetails(style: HairStyle, texture: HairTexture, color: string): string {
  if (style === 'bun') return '';
  const line = `fill="none" stroke="${shade(color, -0.35)}" stroke-width="1" stroke-linecap="round" opacity=".55"`;
  const shine = 'fill="none" stroke="#fff" stroke-linecap="round" opacity=".5" stroke-width="2.2"';
  const bottom = { long: 192, medium: 146, short: 112 }[style];
  const top = 92;

  if (texture === 'curly') {
    // Small coils scattered down each side.
    let coils = '';
    for (let y = top + 8; y < bottom - 6; y += 16) {
      for (const x of [74, 146]) {
        const dir = x < 110 ? 1 : -1;
        coils += `M${x} ${y} q${3 * dir} -4 ${6 * dir} 0 q${3 * dir} 4 ${-1 * dir} 6`;
      }
    }
    return `<path d="${coils}" ${line}/>`;
  }

  if (texture === 'wavy') {
    // S-shaped strands down each side.
    const strand = (x: number) => {
      let d = `M${x} ${top}`;
      for (let y = top, i = 0; y + 12 <= bottom; y += 12, i++) d += ` q${i % 2 ? 4 : -4} 6 0 12`;
      return d;
    };
    return `<path d="${strand(80)} ${strand(140)}" ${line}/>` + `<path d="M85 ${top + 4} q-3 8 0 16" ${shine}/>`;
  }

  // Straight: long strands following the sides.
  return (
    `<path d="M80 ${top} Q78 ${(top + bottom) / 2} 77 ${bottom - 4} M140 ${top} Q142 ${(top + bottom) / 2} 143 ${bottom - 4}" ${line}/>` +
    `<path d="M84 ${top + 8} Q83 ${top + 30} 82 ${Math.min(bottom - 6, top + 52)}" ${shine}/>`
  );
}

/** The shadow the bangs cast on the forehead. */
export function bangShadow(style: HairStyle, texture: HairTexture, skin: string): string {
  if (texture === 'curly') return '';
  const pts = style === 'bun' ? SWEPT_BACK : BANGS;
  const shape = texture === 'wavy' ? wave(pts, 1.4, 16, 44) : resample(pts, 4);
  return `<path d="${smoothPath(shape)}" transform="translate(1.5 3.5)" fill="${shade(skin, -0.18)}" opacity=".8"/>`;
}

/** The hair in front of the face: bangs, or hair swept back for buns. */
export function hairFront(style: HairStyle, texture: HairTexture, color: string): string {
  const attrs = `fill="${color}" stroke="${shade(color, -0.3)}" stroke-width="1.3" stroke-linejoin="round"`;
  if (texture === 'curly') {
    // A fringe of curls along the hairline, outlined only on its outer edge.
    const fringe = [[86, 47], [97, 40], [110, 37], [123, 40], [134, 47]] as const;
    const stroke = shade(color, -0.3);
    return (
      fringe.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9.5" fill="none" stroke="${stroke}" stroke-width="2.6"/>`).join('') +
      fringe.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9.5" fill="${color}"/>`).join('') +
      `<path d="M86 47 Q110 30 134 47 L134 40 Q110 24 86 40 Z" fill="${color}"/>`
    );
  }
  const pts = style === 'bun' ? SWEPT_BACK : BANGS;
  const shape = texture === 'wavy' ? wave(pts, 1.4, 16, 44) : resample(pts, 4);
  if (style === 'bun') {
    // Strands pulled up from the hairline toward the bun, with a small shine on the crown.
    const strands = `<path d="M84 60 Q90 38 106 26 M95 47 Q100 34 109 26 M136 60 Q130 38 114 26 M125 47 Q120 34 111 26" fill="none" stroke="${shade(color, -0.35)}" stroke-width="1" stroke-linecap="round" opacity=".6"/>`;
    const crownShine = '<path d="M89 46 Q93 36 101 30" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>';
    return `<path d="${smoothPath(shape)}" ${attrs}/>${strands}${crownShine}`;
  }
  const shine = '<path d="M90 39 Q100 34 112 35 M119 36 Q128 38 133 43" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".55"/>';
  return `<path d="${smoothPath(shape)}" ${attrs}/>${shine}`;
}
