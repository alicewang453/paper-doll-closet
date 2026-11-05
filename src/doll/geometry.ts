/*
 * Doll coordinate system: a 220 x 560 canvas with the body centered on x = 110.
 * Most shapes are drawn for the left half only and mirrored to the right.
 * The head is drawn at 80% around the neck for fashion-illustration proportions.
 */
import { f1 } from '../lib/color.ts';

export const HEAD_TRANSFORM = 'translate(110 112) scale(.8) translate(-110 -112)';

/** Draws a left-half shape plus its mirror image on the right. */
export const mirror = (svg: string): string => svg + `<g transform="translate(220 0) scale(-1 1)">${svg}</g>`;

/** The x position of the body's left edge at height y (shoulder, waist, hip, thigh). */
export function sideX(y: number): number {
  if (y <= 150) return 72 + ((y - 132) / 18) * 8;
  if (y <= 215) return 80 + ((y - 150) / 65) * 8;
  if (y <= 255) return 88 - ((y - 215) / 40) * 8;
  return 80 - (y - 255) * 0.12;
}

/**
 * A left arm segment from the shoulder down, as a stroked curve with an outline.
 * t is how far down the arm it goes (0.3 is a short sleeve, 1 is the wrist).
 * withClasses marks the parts so closet thumbnails can grey them out.
 */
export function armSegment(t: number, width: number, fill: string, stroke: string, withClasses = false): string {
  const P0 = [74, 136];
  const P1 = [62, 212];
  const P2 = [60, 292];
  const c = [P0[0] + (P1[0] - P0[0]) * t, P0[1] + (P1[1] - P0[1]) * t];
  const e = [
    (1 - t) * (1 - t) * P0[0] + 2 * t * (1 - t) * P1[0] + t * t * P2[0],
    (1 - t) * (1 - t) * P0[1] + 2 * t * (1 - t) * P1[1] + t * t * P2[1],
  ];
  const d = `M${P0[0]} ${P0[1]} Q${f1(c[0])} ${f1(c[1])} ${f1(e[0])} ${f1(e[1])}`;
  const [outline, inner] = withClasses ? [' class="ao"', ' class="af"'] : ['', ''];
  return (
    `<path${outline} d="${d}" fill="none" stroke="${stroke}" stroke-width="${width + 3}" stroke-linecap="round"/>` +
    `<path${inner} d="${d}" fill="none" stroke="${fill}" stroke-width="${width}" stroke-linecap="round"/>`
  );
}

/** A point on the arm's center curve, from the shoulder (s = 0) to the wrist (s = 1). */
function armPoint(s: number): [number, number] {
  const P0 = [74, 136], P1 = [62, 212], P2 = [60, 292];
  const a = (1 - s) * (1 - s), b = 2 * s * (1 - s), c = s * s;
  return [a * P0[0] + b * P1[0] + c * P2[0], a * P0[1] + b * P1[1] + c * P2[1]];
}

/** The arm's direction at s, as a unit vector. */
function armTangent(s: number): [number, number] {
  const dx = 2 * (1 - s) * (62 - 74) + 2 * s * (60 - 62);
  const dy = 2 * (1 - s) * (212 - 136) + 2 * s * (292 - 212);
  const len = Math.hypot(dx, dy);
  return [dx / len, dy / len];
}

/**
 * A left sleeve outline that hugs the arm: half-width `halfTop` at the shoulder, easing
 * to `halfEnd` at the sleeve's end, which is `t` of the way down the arm (0.3 is a short
 * sleeve, 1 reaches the wrist). The shoulder is a soft curve about as wide as the arm,
 * so tops don't look like they have shoulder pads.
 */
export function sleevePath(t: number, halfTop: number, halfEnd: number): string {
  const steps = 10;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const s = (t * i) / steps;
    const [x, y] = armPoint(s);
    const [tx, ty] = armTangent(s);
    // Ease the width so the sleeve stays close to the arm near the shoulder.
    const k = i / steps;
    const half = halfTop + (halfEnd - halfTop) * k * k;
    // (ty, -tx) points away from the body; (-ty, tx) points toward it.
    outer.push(`${f1(x + ty * half)} ${f1(y - tx * half)}`);
    inner.push(`${f1(x - ty * half)} ${f1(y + tx * half)}`);
  }
  // Round the shoulder with an arc over the top of the arm, from the inner edge to the outer edge.
  const [tx, ty] = armTangent(0);
  const cap: string[] = [];
  const start = Math.atan2(tx, -ty);
  for (let i = 1; i < 6; i++) {
    const angle = start + (Math.PI * i) / 6;
    const px = Math.cos(angle) * halfTop;
    const py = Math.sin(angle) * halfTop;
    // Keep the cap close to the bare shoulder's own curve, so it covers it without bulging up.
    const along = (px * tx + py * ty) * 0.9;
    const across = px * ty - py * tx;
    cap.push(`${f1(74 + along * tx + across * ty)} ${f1(136 + along * ty - across * tx)}`);
  }
  return `M${outer.join(' L')} L${[...inner].reverse().join(' L')} L${cap.join(' L')} Z`;
}

export type Neckline = 'crew' | 'tank' | 'skin';

/** The torso outline from the neckline down to a hem at height `hem`. */
export function torsoPath(hem: number, neck: Neckline): string {
  const startY = neck === 'tank' ? 150 : 132;
  let d: string;
  if (neck === 'tank') d = `M${sideX(150)} 150 Q110 168 ${220 - sideX(150)} 150`;
  else if (neck === 'skin') d = 'M72 132 Q110 120 148 132';
  else d = 'M72 132 Q86 124 98 124 Q110 133 122 124 Q134 124 148 132';
  const ys = [150, 215, 255].filter((y) => y > startY && y < hem - 2);
  ys.forEach((y) => (d += ` L${f1(220 - sideX(y))} ${y}`));
  d += ` L${f1(220 - sideX(hem))} ${hem} L${f1(sideX(hem))} ${hem}`;
  [...ys].reverse().forEach((y) => (d += ` L${f1(sideX(y))} ${y}`));
  return d + ' Z';
}

/** The left front panel of an open jacket or cardigan, with a V opening down to vY. */
export function outerHalf(hem: number, vY: number): string {
  const sx = (y: number) => f1(sideX(y) - 3);
  const ys = [150, 215, 255].filter((y) => y < hem - 2);
  let d = `M92 125 L106 ${vY} L106 ${hem} L${sx(hem)} ${hem}`;
  [...ys].reverse().forEach((y) => (d += ` L${sx(y)} ${y}`));
  return d + ' L69 132 Q78 125 92 125 Z';
}

/** The turned-out foot shape every shoe is built on (left foot). */
export const FOOT_OUTLINE = 'Q85 520 82.6 530 Q79.6 541 81.8 547.6 Q85.6 552.4 91.6 548.6 Q99 541 103.6 529 Q106 519';
