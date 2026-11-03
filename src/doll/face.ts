import { f1, shade } from '../lib/color.ts';
import type { Avatar } from '../items/types.ts';

const DARK = '#1D1418';

/**
 * The ink-style face: almond eyes with a winged lash line, blush with hatch marks,
 * a small nose, shaped lips and a beauty mark. Drawn in head coordinates.
 * Returns clip-path defs separately because SVG ids must live in <defs>.
 */
export function inkFace(av: Avatar, idPrefix: string): { defs: string; svg: string } {
  const brow = shade(av.hair, -0.2);
  let defs = '';
  let svg = '';
  for (const [x, o] of [[97, -1], [123, 1]] as const) {
    // o points toward the outer corner of each eye.
    const ix = x - o * 7, iy = 79.2;
    const ox = x + o * 8.2, oy = 76.6;
    const ux = x + o * 0.8, uy = 70.4;
    const lx = x - o * 0.5, ly = 83;
    const clipId = `${idPrefix}-eye${x}`;
    const eye = `M${f1(ix)} ${iy} Q${f1(ux)} ${uy} ${f1(ox)} ${oy} Q${f1(lx)} ${ly} ${f1(ix)} ${iy} Z`;
    defs += `<clipPath id="${clipId}"><path d="${eye}"/></clipPath>`;
    svg +=
      `<ellipse cx="${f1(x + o * 1.5)}" cy="72.6" rx="8.6" ry="4.2" transform="rotate(${-o * 8} ${f1(x + o * 1.5)} 72.6)" fill="#C9787C" opacity=".2"/>` +
      `<path d="${eye}" fill="#FBF7F4"/>` +
      `<g clip-path="url(#${clipId})">` +
      `<circle cx="${x}" cy="77.8" r="4.6" fill="${av.eyes}"/>` +
      `<circle cx="${x}" cy="77.8" r="4.6" fill="none" stroke="${shade(av.eyes, -0.45)}" stroke-width=".9"/>` +
      `<circle cx="${x}" cy="77.8" r="2.1" fill="${DARK}"/>` +
      `<path d="M${f1(ix)} ${iy} Q${f1(ux)} ${uy} ${f1(ox)} ${oy} L${f1(ox)} ${oy - 1} L${f1(ix)} ${iy - 6} Z" fill="${DARK}" opacity=".2"/>` +
      `<circle cx="${x + 1.7}" cy="76.1" r="1.25" fill="#fff"/>` +
      `<circle cx="${x - 1.5}" cy="79.6" r=".55" fill="#fff" opacity=".85"/>` +
      '</g>' +
      // Lash line: a filled shape that tapers into a wing.
      `<path d="M${f1(ix)} ${iy + 0.2} Q${f1(ux)} ${uy} ${f1(ox)} ${oy} L${f1(x + o * 11.4)} 73.4 Q${f1(x + o * 1)} 67.6 ${f1(ix - o * 0.4)} ${iy - 1.4} Z" fill="${DARK}"/>` +
      `<path d="M${f1(x + o * 5)} 73.5 L${f1(x + o * 7.6)} 70.6 M${f1(x + o * 2.4)} 72.2 L${f1(x + o * 3.6)} 69.2" stroke="${DARK}" stroke-width=".9" stroke-linecap="round"/>` +
      `<path d="M${f1(x - o * 5)} 71 Q${f1(x + o * 1)} 66.6 ${f1(x + o * 7.8)} 70.4" fill="none" stroke="#8A5048" stroke-width=".8" stroke-linecap="round" opacity=".6"/>` +
      `<path d="M${f1(x + o * 0.5)} 81.9 Q${f1(x + o * 5.2)} 81.6 ${f1(ox - o * 0.3)} ${oy + 0.6}" fill="none" stroke="#5A3530" stroke-width=".7" stroke-linecap="round" opacity=".55"/>` +
      `<path d="M${f1(x - o * 6.6)} 65.2 Q${f1(x + o * 1.5)} 59.2 ${f1(x + o * 8.8)} 63.4 Q${f1(x + o * 1.5)} 60.8 ${f1(x - o * 6.2)} 63.6 Z" fill="${brow}"/>`;
  }

  let hatch = '';
  for (const cx of [89, 131]) for (let k = 0; k < 3; k++) hatch += `M${f1(cx - 3 + k * 2.6)} 90.6 L${f1(cx - 1.6 + k * 2.6)} 87.6 `;
  const lipLine = shade(av.lips, -0.4);
  svg +=
    '<ellipse cx="89" cy="89" rx="7.5" ry="3.6" fill="#E8838E" opacity=".28"/>' +
    '<ellipse cx="131" cy="89" rx="7.5" ry="3.6" fill="#E8838E" opacity=".28"/>' +
    `<path d="${hatch}" stroke="#D9606F" stroke-width=".7" stroke-linecap="round" opacity=".55"/>` +
    '<path d="M108.8 81 Q107.4 86.6 108.6 88.6" fill="none" stroke="#9A5444" stroke-width=".8" stroke-linecap="round" opacity=".45"/>' +
    '<path d="M107.4 89.6 Q110 91.1 112.7 89.4" fill="none" stroke="#9A5444" stroke-width="1" stroke-linecap="round"/>' +
    '<g transform="translate(110 98) scale(.88) translate(-110 -98)">' +
    `<path d="M102.6 97.6 Q105.4 94.4 108.2 95.2 Q110 96.2 111.8 95.2 Q114.6 94.4 117.4 97.6 Q110 98.6 102.6 97.6 Z" fill="${shade(av.lips, -0.14)}" stroke="${lipLine}" stroke-width=".6"/>` +
    `<path d="M102.6 97.6 Q104.6 102.8 110 103 Q115.4 102.8 117.4 97.6 Q110 98.6 102.6 97.6 Z" fill="${av.lips}" stroke="${lipLine}" stroke-width=".6"/>` +
    `<path d="M102.3 97.5 Q110 99 117.7 97.5" fill="none" stroke="${lipLine}" stroke-width=".9" stroke-linecap="round"/>` +
    '<path d="M107.6 100.6 Q110 101.4 112.2 100.4" fill="none" stroke="#fff" stroke-width=".8" opacity=".4" stroke-linecap="round"/>' +
    '<circle cx="106.2" cy="96.4" r=".6" fill="#fff" opacity=".4"/>' +
    '</g>' +
    '<circle cx="127.6" cy="100.4" r=".9" fill="#3B2422"/>';
  return { defs, svg };
}
