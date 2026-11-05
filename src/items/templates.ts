/*
 * Clothing templates. Each one draws an item from its parameters (color, second color,
 * pattern, length) in doll coordinates, so every variation stays fitted to the body.
 */
import { f1, shade } from '../lib/color.ts';
import { FOOT_OUTLINE, mirror, outerHalf, sideX, sleevePath, torsoPath } from '../doll/geometry.ts';
import type { StyleAttrs, Template, TemplateId } from './types.ts';

/** A fitted left sleeve, drawn behind the torso so the body covers its top. */
const sleeve = (t: number, halfTop: number, halfEnd: number, F: string, S: string, st: StyleAttrs) =>
  `<path d="${sleevePath(t, halfTop, halfEnd)}" ${st(F, S)}/>`;

const ELBOW = 'M57 209 Q63 214 71 210 M58 218 Q63 221 70 218';
const waistband = (color: string, stroke: string, x: number, width: number) =>
  `<rect x="${x}" y="211" width="${width}" height="8" fill="${shade(color, -0.15)}" stroke="${stroke}" stroke-width="1.2"/>`;

const teeHem = (length: number) => Math.round(185 + length * 0.65);
const sweaterHem = (length: number) => Math.round(190 + length * 0.65);
const cardiganHem = (length: number) => Math.round(200 + length);
const jacketHem = (length: number) => Math.round(230 + length * 1.4);
const skirtHem = (length: number) => Math.round(252 + length * 2.1);
const shortsHem = (length: number) => Math.round(264 + length * 0.4);
const bootTop = (length: number) => Math.round(529 - (40 + length * 2));

export const TEMPLATES: Record<TemplateId, Template> = {
  tee: {
    label: 'Tee', slot: 'top', tab: 'tops', thumb: [36, 108, 148, 150], shape: 'Length',
    def: { color: '#FAFAF5', color2: '#2A3D6E', pattern: 'solid', length: 55 },
    draw: (p, F, S, st) => mirror(sleeve(0.3, 9.5, 11.5, F, S, st)) + `<path d="${torsoPath(teeHem(p.length), 'crew')}" ${st(F, S)}/>`,
    folds: (p) => {
      const h = teeHem(p.length);
      return mirror('<path d="M64 168 Q69 173 75 170"/>') +
        `<path d="M94 ${h - 12} Q100 ${h - 6} 108 ${h - 10} M116 ${h - 14} Q122 ${h - 8} 128 ${h - 11}"/><path d="M100 150 Q104 170 101 190"/>`;
    },
  },
  sweater: {
    label: 'Sweater', slot: 'top', tab: 'tops', knit: true, thumb: [36, 108, 148, 190], shape: 'Length',
    def: { color: '#9C9AA6', color2: '#FAFAF5', pattern: 'solid', length: 60 },
    draw: (p, F, S, st) => {
      const h = sweaterHem(p.length);
      return mirror(sleeve(0.93, 9.5, 10, F, S, st)) +
        `<path d="${torsoPath(h, 'crew')}" ${st(F, S)}/>` +
        `<path d="M${f1(sideX(h - 7))} ${h - 7} L${f1(220 - sideX(h - 7))} ${h - 7}" stroke="${S}" stroke-width="1.2"/>` +
        `<path d="M98 124 Q110 133 122 124" fill="none" stroke="${S}" stroke-width="3"/>`;
    },
    folds: (p) => {
      const h = sweaterHem(p.length);
      return mirror(`<path d="${ELBOW}"/><path d="M57 268 L63 268 M57 272 L63 272"/>`) +
        `<path d="M92 ${h - 16} Q99 ${h - 10} 106 ${h - 15} M114 ${h - 13} Q121 ${h - 8} 128 ${h - 14} M98 150 Q103 175 99 200"/>`;
    },
  },
  tank: {
    label: 'Tank', slot: 'top', tab: 'tops', thumb: [50, 108, 120, 150], shape: 'Length',
    def: { color: '#C93A4C', color2: '#FAFAF5', pattern: 'dots', length: 45 },
    draw: (p, F, S, st) =>
      mirror(`<path d="M87 130 L84 152" stroke="${S}" stroke-width="6" stroke-linecap="round"/><path d="M87 130 L84 152" stroke="${F}" stroke-width="3.5" stroke-linecap="round"/>`) +
      `<path d="${torsoPath(teeHem(p.length), 'tank')}" ${st(F, S)}/>`,
    folds: (p) => {
      const h = teeHem(p.length);
      return `<path d="M95 ${h - 10} Q101 ${h - 5} 108 ${h - 9} M100 166 Q104 182 101 196"/>`;
    },
  },
  cardigan: {
    label: 'Cardigan', slot: 'outer', tab: 'tops', knit: true, thumb: [30, 108, 160, 230], shape: 'Length',
    def: { color: '#F3DE8A', color2: '#FAFAF5', pattern: 'solid', length: 25 },
    draw: (p, F, S, st) => {
      const h = cardiganHem(p.length);
      let buttons = '';
      for (let y = 178; y < h - 6; y += 16) buttons += `<circle cx="102" cy="${y}" r="2.6" fill="${shade(p.color, -0.45)}"/>`;
      return mirror(sleeve(0.95, 10.5, 11, F, S, st)) +
        mirror(`<path d="${outerHalf(h, 170)}" ${st(F, S)}/><path d="M${f1(sideX(h - 6) - 3)} ${h - 6} L106 ${h - 6}" stroke="${S}" stroke-width="1.2"/>`) +
        buttons;
    },
    folds: () => mirror(`<path d="${ELBOW}"/><path d="M92 128 L104 168"/>`),
  },
  jacket: {
    label: 'Jacket', slot: 'outer', tab: 'tops', thumb: [24, 108, 172, 270], shape: 'Length', usesColor2: true,
    def: { color: '#C49A6C', color2: '#7A4E2D', pattern: 'solid', length: 50 },
    draw: (p, F, S, st) => {
      const h = jacketHem(p.length);
      return mirror(sleeve(0.97, 11, 11.5, F, S, st)) +
        mirror(
          `<path d="${outerHalf(h, 160)}" ${st(F, S)}/>` +
          `<path d="M92 125 L106 160 L97 167 L80 131 Z" fill="${p.color2}" stroke="${S}" stroke-width="1.3" stroke-linejoin="round"/>` +
          `<rect x="80" y="${h - 44}" width="18" height="15" rx="2" fill="none" stroke="${S}" stroke-width="1.3"/>`,
        ) +
        [176, 198, 220].filter((y) => y < h - 10).map((y) => `<circle cx="102" cy="${y}" r="2.8" fill="${p.color2}" stroke="${S}"/>`).join('');
    },
    folds: (p) => {
      const h = jacketHem(p.length);
      return mirror(`<path d="${ELBOW}"/><path d="M86 170 Q90 ${(170 + h) / 2} 88 ${h - 8}"/>`);
    },
  },
  skirt: {
    label: 'Skirt', slot: 'bottom', tab: 'bottoms', thumb: [30, 200, 160, 270], shape: 'Length',
    def: { color: '#C93A4C', color2: '#2A3D6E', pattern: 'plaid', length: 15 },
    draw: (p, F, S, st) => {
      const h = skirtHem(p.length);
      const flare = (h - 212) * 0.2;
      let pleats = '';
      for (const k of [-2, -1, 1, 2])
        pleats += `<path d="M${110 + k * 10} 222 L${f1(110 + k * (10 + flare / 2.4))} ${h - 2}" stroke="${S}" stroke-width="1" opacity=".55"/>`;
      return `<path d="M86 212 L134 212 L${f1(134 + flare)} ${h} Q110 ${h + 6} ${f1(86 - flare)} ${h} Z" ${st(F, S)}/>` +
        pleats + waistband(p.color, S, 86, 48);
    },
    folds: (p) => {
      const h = skirtHem(p.length);
      const flare = (h - 212) * 0.2;
      return `<path d="M${f1(92 - flare * 0.6)} ${h - 4} Q${f1(98 - flare * 0.3)} ${h - 12} 104 ${h - 3} M116 ${h - 3} Q${f1(122 + flare * 0.3)} ${h - 12} ${f1(128 + flare * 0.6)} ${h - 4}"/>`;
    },
  },
  trousers: {
    label: 'Trousers', slot: 'bottom', tab: 'bottoms', thumb: [40, 200, 140, 322], shape: 'Leg width',
    def: { color: '#5E7FB3', color2: '#FAFAF5', pattern: 'solid', length: 80 },
    draw: (p, F, S, st) => {
      const w = 2 + p.length * 0.14;
      return `<path d="M84 212 L136 212 L140 252 L${f1(134 + w)} 512 L${f1(114 - w * 0.2)} 512 L110 266 L${f1(106 + w * 0.2)} 512 L${f1(86 - w)} 512 L80 252 Z" ${st(F, S)}/>` +
        mirror(`<path d="M95 272 L${f1(95 - w * 0.45)} 506" stroke="${S}" stroke-width="1" opacity=".5"/>`) +
        waistband(p.color, S, 84, 52);
    },
    folds: () => mirror('<path d="M89 382 Q95 387 103 383 M90 389 Q96 392 102 389 M87 498 Q95 503 105 499"/><path d="M104 226 Q106 240 109 252"/>'),
  },
  shorts: {
    label: 'Shorts', slot: 'bottom', tab: 'bottoms', thumb: [56, 200, 108, 110], shape: 'Length',
    def: { color: '#A9C0A0', color2: '#FAFAF5', pattern: 'solid', length: 40 },
    draw: (p, F, S, st) => {
      const h = shortsHem(p.length);
      return `<path d="M84 212 L136 212 L141 ${h} L112 ${h} L110 258 L108 ${h} L79 ${h} Z" ${st(F, S)}/>` + waistband(p.color, S, 84, 52);
    },
    folds: (p) => {
      const h = shortsHem(p.length);
      return mirror(`<path d="M86 ${h - 6} Q94 ${h - 10} 104 ${h - 5} M104 226 Q106 240 109 252"/>`);
    },
  },
  // Feet are drawn turned out and tipped toward the viewer, so the tops of shoes show.
  sneakers: {
    label: 'Sneakers', slot: 'shoes', tab: 'shoes', thumb: [58, 500, 104, 58],
    def: { color: '#FAFAF5', color2: '#E2457A', pattern: 'solid', length: 50 },
    draw: (p, F, S, st) => {
      const lace = p.color === '#FAFAF5' ? '#9C9AA6' : shade(p.color, 0.6);
      const upper = `M86.6 510.6 ${FOOT_OUTLINE} 105.6 510.6 Q96 514.6 86.6 510.6 Z`;
      return mirror(
        `<path d="${upper}" transform="translate(.5 2.4)" fill="#FAFAF5" stroke="${S}" stroke-width="1.2" stroke-linejoin="round"/>` +
        `<path d="${upper}" ${st(F, S)}/>` +
        `<path d="M90.4 512.8 L85.4 532.3 M100.6 515.6 L95.1 534.9" fill="none" stroke="${S}" stroke-width=".9" opacity=".55"/>` +
        `<path d="M90.6 516.0 L98.7 518.1 M89.3 520.6 L97.5 522.8 M88.1 525.3 L96.2 527.5 M86.9 530.0 L95.0 532.2" stroke="${lace}" stroke-width="1.3" stroke-linecap="round"/>` +
        `<path d="M82.6 535 Q91 543.6 103.4 531" fill="none" stroke="${p.color2}" stroke-width="2" stroke-linecap="round"/>`,
      );
    },
  },
  boots: {
    label: 'Boots', slot: 'shoes', tab: 'shoes', thumb: [54, 300, 112, 258], shape: 'Height',
    def: { color: '#7A4E2D', color2: '#FAFAF5', pattern: 'solid', length: 70 },
    draw: (p, F, S, st) => {
      const top = bootTop(p.length);
      const L = (y: number) => f1(82 + ((y - 250) * 6) / 270 - 2);
      const R = (y: number) => f1(108 - ((y - 250) * 4) / 270 + 2);
      const shape = `M${L(top)} ${top} L${R(top)} ${top} L${R(510.6)} 510.6 Q106 519 103.6 529 Q99 541 91.6 548.6 Q85.6 552.4 81.8 547.6 Q79.6 541 82.6 530 Q85 520 ${L(510.6)} 510.6 Z`;
      return mirror(
        `<path d="${shape}" transform="translate(.4 1.4)" fill="${shade(p.color, -0.5)}"/>` +
        `<path d="${shape}" ${st(F, S)}/>` +
        `<path d="M${L(top + 6)} ${top + 6} L${R(top + 6)} ${top + 6}" stroke="${S}" stroke-width="1.2"/>` +
        '<path d="M85.2 537 Q85.8 543.4 89.4 545.6" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".35"/>',
      );
    },
    folds: () => mirror('<path d="M88 500 Q95 504 104 500 M89 492 Q95 495 103 492 M86 518 Q90 521 95 520"/>'),
  },
  maryjanes: {
    label: 'Mary Janes', slot: 'shoes', tab: 'shoes', thumb: [58, 500, 104, 58],
    def: { color: '#2A2730', color2: '#FAFAF5', pattern: 'solid', length: 50 },
    draw: (p, F, S, st) => {
      const vamp = 'M83.4 527 Q93.6 533.4 104.4 526.6 Q103.8 534 99 541 Q95.4 546 91.6 548.6 Q85.6 552.4 81.8 547.6 Q79.6 541 83.4 527 Z';
      const strap = 'M85.2 520.4 Q95.6 525.4 105.4 518';
      return mirror(
        `<path d="${vamp}" transform="translate(.4 1.4)" fill="${shade(p.color, -0.55)}"/>` +
        `<path d="${vamp}" ${st(F, S)}/>` +
        `<path d="${strap}" fill="none" stroke="${S}" stroke-width="3.8" stroke-linecap="round"/>` +
        `<path d="${strap}" fill="none" stroke="${F}" stroke-width="2.3" stroke-linecap="round"/>` +
        `<rect x="101.4" y="517.6" width="3.4" height="3.4" rx=".8" transform="rotate(-20 103.1 519.3)" fill="none" stroke="${shade(p.color, 0.55)}" stroke-width=".9"/>` +
        '<path d="M84.6 535.6 Q85.2 542.6 88.8 545.4" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".4"/>',
      );
    },
  },
  // Head and eye items are drawn in head coordinates.
  beret: {
    label: 'Beret', slot: 'head', tab: 'extras', thumb: [64, 22, 94, 62],
    def: { color: '#6E2035', color2: '#FAFAF5', pattern: 'solid', length: 50 },
    draw: (_p, F, S, st) =>
      `<ellipse cx="106" cy="36" rx="39" ry="13" transform="rotate(-10 106 36)" ${st(F, S)}/>` +
      `<path d="M71 44 Q106 50 141 30" fill="none" stroke="${S}" stroke-width="1.2"/><circle cx="104" cy="22" r="3.2" fill="${S}"/>`,
  },
  bow: {
    label: 'Hair bow', slot: 'head', tab: 'extras', thumb: [104, 34, 54, 46],
    def: { color: '#F2A9C4', color2: '#FAFAF5', pattern: 'solid', length: 50 },
    draw: (_p, F, S, st) => `<path d="M136 42 L119 31 L121 54 Z M136 42 L153 31 L151 54 Z" ${st(F, S)}/><circle cx="136" cy="42" r="5" ${st(F, S)}/>`,
  },
  sunglasses: {
    label: 'Sunglasses', slot: 'eyes', tab: 'extras', thumb: [76, 64, 68, 38],
    def: { color: '#2A2730', color2: '#FAFAF5', pattern: 'solid', length: 50 },
    draw: (_p, F, S, st) =>
      `<rect x="88" y="70" width="19" height="14" rx="5" ${st(F, S, ' fill-opacity=".92"')}/>` +
      `<rect x="113" y="70" width="19" height="14" rx="5" ${st(F, S, ' fill-opacity=".92"')}/>` +
      `<path d="M107 75 L113 75 M88 74 L79 72 M132 74 L141 72" stroke="${S}" stroke-width="2"/>` +
      '<path d="M91 73 L96 73 M116 73 L121 73" stroke="#fff" stroke-width="1.4" opacity=".6"/>',
  },
  necklace: {
    label: 'Necklace', slot: 'neck', tab: 'extras', thumb: [82, 118, 56, 40],
    def: { color: '#FAFAF5', color2: '#FAFAF5', pattern: 'solid', length: 50 },
    draw: (_p, F, S, st) => {
      let beads = '';
      for (let i = 0; i <= 14; i++) {
        const t = i / 14;
        const x = (1 - t) * (1 - t) * 92 + 2 * t * (1 - t) * 110 + t * t * 128;
        const y = (1 - t) * (1 - t) * 129 + 2 * t * (1 - t) * 152 + t * t * 129;
        beads += `<circle cx="${f1(x)}" cy="${f1(y)}" r="2.4" ${st(F, S, ' stroke-width="0.8"')}/>`;
      }
      return beads;
    },
  },
  bag: {
    label: 'Shoulder bag', slot: 'bag', tab: 'extras', thumb: [72, 122, 100, 130], usesColor2: true,
    def: { color: '#C49A6C', color2: '#7A4E2D', pattern: 'solid', length: 50 },
    draw: (p, F, S, st) =>
      `<path d="M80 133 L146 224" stroke="${p.color2}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<rect x="132" y="220" width="32" height="26" rx="5" ${st(F, S)}/>` +
      `<path d="M132 226 Q148 238 164 226" fill="none" stroke="${S}" stroke-width="1.3"/><circle cx="148" cy="233" r="2.4" fill="${p.color2}"/>`,
  },
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[];

/** Items in these slots are drawn in head coordinates and scaled with the head. */
export const HEAD_SLOTS = ['head', 'eyes'];
