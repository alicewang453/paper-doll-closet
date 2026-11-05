import { esc } from '../lib/color.ts';
import { BASE_BOTTOM, BASE_TOP, bodySkin, headSkin } from '../doll/body.ts';
import { HEAD_TRANSFORM } from '../doll/geometry.ts';
import { bangShadow, hairBack, hairDetails, hairFront } from '../doll/hair.ts';
import { inkFace } from '../doll/face.ts';
import type { Avatar, Item, Slot, Worn } from '../items/types.ts';
import { inkDefs, maskDef, overlay, renderItem } from './ink.ts';

/** Where each worn item's label points (anchor) and which side its text sits on. */
const LABELS: Partial<Record<Slot, { anchor: [number, number]; side: 'L' | 'R'; y: number }>> = {
  head: { anchor: [122, 48], side: 'R', y: 40 },
  eyes: { anchor: [130, 76], side: 'R', y: 86 },
  neck: { anchor: [120, 140], side: 'R', y: 138 },
  top: { anchor: [110, 190], side: 'L', y: 166 },
  outer: { anchor: [76, 250], side: 'L', y: 250 },
  bag: { anchor: [160, 236], side: 'R', y: 204 },
  bottom: { anchor: [128, 244], side: 'R', y: 290 },
  shoes: { anchor: [86, 544], side: 'L', y: 468 },
};

/** Splits text into at most three lines of about `max` characters. */
export function wrapWords(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? line + ' ' + word : word;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function labelsSvg(worn: Worn, items: Item[]): string {
  let svg = '';
  for (const slot of Object.keys(LABELS) as Slot[]) {
    const item = worn[slot] && items.find((i) => i.id === worn[slot]);
    const spec = LABELS[slot];
    if (!item || !spec) continue;
    const [ax, ay] = spec.anchor;
    const left = spec.side === 'L';
    const lineEnd = left ? -6 : 226;
    const textX = left ? -10 : 230;
    const control = left ? ax - 42 : ax + 42;
    const lines = wrapWords(item.name.toLowerCase(), 11);
    svg +=
      `<path class="ldr" d="M${ax} ${ay} Q${control} ${spec.y} ${lineEnd} ${spec.y}"/>` +
      `<circle class="ldot" cx="${ax}" cy="${ay}" r="1.8"/>` +
      `<text class="lbl" x="${textX}" y="${spec.y + 5}" text-anchor="${left ? 'end' : 'start'}">` +
      lines.map((l, i) => `<tspan x="${textX}" dy="${i ? 16 : 0}">${esc(l)}</tspan>`).join('') +
      '</text>';
  }
  return svg;
}

export interface DollOptions {
  /** Prefix for SVG ids, unique per SVG on the page. */
  idPrefix: string;
  label?: string;
  /** Show handwritten labels for worn items (widens the drawing). */
  labels?: boolean;
}

/** The dressed doll as an SVG string. */
export function dollSvg(av: Avatar, worn: Worn, items: Item[], opts: DollOptions): string {
  const pfx = opts.idPrefix;
  let defs = inkDefs(pfx);
  const layers: Partial<Record<Slot, string>> = {};
  for (const slot of Object.keys(worn) as Slot[]) {
    const item = items.find((i) => i.id === worn[slot]);
    if (!item) continue;
    const r = renderItem(item, pfx);
    defs += r.defs;
    layers[slot] = r.svg;
  }

  const skinLine = '#9A5444';
  const bodyMask = `${pfx}-bodym`;
  defs += maskDef(pfx, bodyMask, bodySkin('#fff', '#fff'));
  const body = bodySkin(av.skin, skinLine) + overlay(pfx, 'cel', bodyMask);
  const head = headSkin(av.skin, skinLine) + bangShadow(av.hairTexture, av.skin);
  const back = hairBack(av.hairStyle, av.hairTexture, av.hair) + hairDetails(av.hairStyle, av.hairTexture, av.hair);
  const front = hairFront(av.hairTexture, av.hair);
  const face = inkFace(av, pfx);
  defs += face.defs;

  // Layer order, back to front: back hair, body, shoes, bottoms, tops, outerwear, necklace, head.
  const figure =
    `<g transform="${HEAD_TRANSFORM}">${back}</g>${body}` +
    (!worn.top && !worn.outer ? BASE_TOP : '') +
    (!worn.bottom ? BASE_BOTTOM : '') +
    (layers.shoes ?? '') + (layers.bottom ?? '') + (layers.top ?? '') + (layers.outer ?? '') + (layers.neck ?? '') +
    `<g transform="${HEAD_TRANSFORM}">${head}${front}</g>`;
  const accessories = (layers.eyes ?? '') + (layers.head ?? '') + (layers.bag ?? '');

  const wide = Boolean(opts.labels);
  return (
    `<svg viewBox="${wide ? '-130 0 480 560' : '0 0 220 560'}"${wide ? ' class="wide"' : ''} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(opts.label ?? 'Dressed doll')}">` +
    `<defs>${defs}</defs>` +
    '<ellipse class="floor" cx="110" cy="550" rx="72" ry="8"/>' +
    `<g filter="url(#${pfx}-ink)">${figure}</g>` +
    `<g transform="${HEAD_TRANSFORM}"><g filter="url(#${pfx}-inkface)">${face.svg}</g></g>` +
    `<g filter="url(#${pfx}-ink)">${accessories}</g>` +
    (wide ? labelsSvg(worn, items) : '') +
    '</svg>'
  );
}
