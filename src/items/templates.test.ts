import { describe, expect, it } from 'vitest';
import { TEMPLATES, TEMPLATE_IDS } from './templates.ts';
import type { ItemParams, StyleAttrs } from './types.ts';

const st: StyleAttrs = (fill, stroke, extra = '') => `fill="${fill}" stroke="${stroke}"${extra}`;

/** Every x/y point an SVG string places: path commands, circles, ellipses and rects. */
function points(svg: string): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (const [, d] of svg.matchAll(/ d="([^"]+)"/g)) {
    for (const [, , args] of d.matchAll(/([MLQT])([^MLQTZHV]*)/g)) {
      const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
      for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
    }
  }
  for (const [, x, y] of svg.matchAll(/cx="([-\d.]+)" cy="([-\d.]+)"/g)) pts.push([Number(x), Number(y)]);
  for (const [, x, y, w, h] of svg.matchAll(/<rect x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/g)) {
    pts.push([Number(x), Number(y)], [Number(x) + Number(w), Number(y) + Number(h)]);
  }
  return pts;
}

const bounds = (pts: Array<[number, number]>) => ({
  minX: Math.min(...pts.map((p) => p[0])),
  maxX: Math.max(...pts.map((p) => p[0])),
  minY: Math.min(...pts.map((p) => p[1])),
  maxY: Math.max(...pts.map((p) => p[1])),
});

const draw = (id: keyof typeof TEMPLATES, length: number) => {
  const params: ItemParams = { ...TEMPLATES[id].def, length };
  return TEMPLATES[id].draw(params, '#123456', '#000000', st);
};

describe.each(TEMPLATE_IDS)('%s template', (id) => {
  const slot = TEMPLATES[id].slot;

  it.each([0, 50, 100])('draws valid coordinates inside the doll canvas at length %i', (length) => {
    const svg = draw(id, length);
    expect(svg).not.toMatch(/NaN|undefined|Infinity/);
    const pts = points(svg);
    expect(pts.length).toBeGreaterThan(0);
    const b = bounds(pts);
    expect(b.minX).toBeGreaterThanOrEqual(20);
    expect(b.maxX).toBeLessThanOrEqual(200);
    expect(b.minY).toBeGreaterThanOrEqual(0);
    expect(b.maxY).toBeLessThanOrEqual(560);
  });

  it('stays anchored to the body at its smallest and largest settings', () => {
    for (const length of [0, 100]) {
      const b = bounds(points(draw(id, length)));
      if (slot === 'top' || slot === 'outer') {
        // Starts at the shoulders and neckline.
        expect(b.minY).toBeGreaterThanOrEqual(120);
        expect(b.minY).toBeLessThanOrEqual(140);
      }
      if (slot === 'bottom') {
        // Starts at the waistband.
        expect(b.minY).toBeGreaterThanOrEqual(210);
        expect(b.minY).toBeLessThanOrEqual(213);
      }
      if (slot === 'shoes') {
        // Reaches the floor, where the feet are.
        expect(b.maxY).toBeGreaterThanOrEqual(545);
      }
      if (slot === 'head' || slot === 'eyes') {
        // Drawn in head coordinates, above the chin.
        expect(b.maxY).toBeLessThanOrEqual(115);
      }
    }
  });
});

describe('length parameter', () => {
  it('makes skirts, tops, jackets and boots longer as it increases', () => {
    // Measure only the garment body (the shapes using the main fill), not sleeves.
    const mainShapes = (svg: string) => [...svg.matchAll(/<path d="[^"]+" fill="#123456"[^>]*>/g)].map((m) => m[0]).join('');
    const lowest = (id: keyof typeof TEMPLATES, length: number) => bounds(points(mainShapes(draw(id, length)))).maxY;
    for (const id of ['tee', 'sweater', 'cardigan', 'jacket', 'skirt', 'shorts'] as const) {
      expect(lowest(id, 100)).toBeGreaterThan(lowest(id, 0));
    }
    const bootTop = (length: number) => bounds(points(draw('boots', length))).minY;
    expect(bootTop(100)).toBeLessThan(bootTop(0));
  });

  it('makes trousers wider as it increases', () => {
    const width = (length: number) => {
      const b = bounds(points(draw('trousers', length)));
      return b.maxX - b.minX;
    };
    expect(width(100)).toBeGreaterThan(width(0));
  });
});
