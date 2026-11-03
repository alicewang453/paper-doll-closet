import { shade } from '../lib/color.ts';
import type { HairStyle } from '../items/types.ts';

// All hair is drawn in head coordinates (wrap in HEAD_TRANSFORM).

const CURLS: Array<[number, number]> = (() => {
  const points: Array<[number, number]> = [];
  for (let i = 0; i <= 10; i++) {
    const angle = Math.PI + (i * Math.PI) / 10;
    points.push([110 + 42 * Math.cos(angle), 68 + 42 * Math.sin(angle)]);
  }
  for (let y = 84; y <= 150; y += 16) points.push([70, y], [150, y]);
  return points;
})();

/** The hair behind the head. */
export function hairBack(style: HairStyle, color: string): string {
  const attrs = `fill="${color}" stroke="${shade(color, -0.3)}" stroke-width="1.3"`;
  if (style === 'long') return `<path d="M76 72 Q72 22 110 22 Q148 22 144 72 Q150 140 152 196 Q110 208 68 196 Q70 140 76 72 Z" ${attrs}/>`;
  if (style === 'bob') return `<path d="M76 72 Q72 22 110 22 Q148 22 144 72 L148 114 Q132 120 120 116 L100 116 Q88 120 72 114 Z" ${attrs}/>`;
  if (style === 'bun') return `<circle cx="110" cy="24" r="17" ${attrs}/><path d="M78 74 Q76 28 110 28 Q144 28 142 74 L138 90 L82 90 Z" ${attrs}/>`;
  return CURLS.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y}" r="14" ${attrs}/>`).join('');
}

/** Strand lines and flat highlights over the back hair, plus a few loose curls. */
export function hairDetails(style: HairStyle, color: string): string {
  const strand = `fill="none" stroke="${shade(color, -0.35)}" stroke-width="1" stroke-linecap="round" opacity=".55"`;
  const highlight = 'fill="none" stroke="#fff" stroke-linecap="round" opacity=".5"';
  const curl = `fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"`;
  if (style === 'long')
    return (
      `<path d="M80 90 Q78 140 76 190 M88 110 Q86 150 84 196 M140 90 Q142 140 144 190 M132 110 Q134 150 136 196" ${strand}/>` +
      `<path d="M84 100 Q83 126 81 150" ${highlight} stroke-width="2.2"/>` +
      `<path d="M68 192 q-7 6 -3 13 q5 4 9 -1 M152 190 q8 5 5 13 q-4 5 -9 1 M75 150 q-9 3 -9 11" ${curl}/>`
    );
  if (style === 'bob')
    return (
      `<path d="M80 86 Q78 100 78 112 M140 86 Q142 100 142 112" ${strand}/>` +
      `<path d="M72 112 q-6 4 -4 10 q4 3 7 -1 M148 112 q6 4 4 10 q-4 3 -7 -1" ${curl}/>`
    );
  if (style === 'curly') return `<path d="M60 150 q-6 8 0 14 q6 2 6 -5 M160 150 q6 8 0 14 q-6 2 -6 -5" ${curl}/>`;
  return `<path d="M96 12 q4 -6 10 -3" ${curl}/>`;
}

const BANGS = 'M78 72 Q78 30 110 30 Q142 30 142 72 Q138 50 124 45 Q106 57 84 53 Q80 61 78 72 Z';
const BUN_FRONT = 'M80 66 Q82 32 110 32 Q138 32 140 66 Q130 45 110 45 Q90 45 80 66 Z';

/** The shadow the bangs cast on the forehead. */
export function bangShadow(style: HairStyle, skin: string): string {
  if (style === 'curly') return '';
  const d = style === 'bun' ? BUN_FRONT : BANGS;
  return `<path d="${d}" transform="translate(1.5 3.5)" fill="${shade(skin, -0.18)}" opacity=".8"/>`;
}

/** The hair in front of the face (bangs or curls), with a flat white highlight. */
export function hairFront(style: HairStyle, color: string): string {
  const attrs = `fill="${color}" stroke="${shade(color, -0.3)}" stroke-width="1.3" stroke-linejoin="round"`;
  const shine = '<path d="M90 39 Q100 34 112 35 M119 36 Q128 38 133 43" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".55"/>';
  if (style === 'curly')
    return ([[88, 44], [102, 38], [118, 38], [132, 44]] as const).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" ${attrs}/>`).join('');
  return `<path d="${style === 'bun' ? BUN_FRONT : BANGS}" ${attrs}/>${shine}`;
}
