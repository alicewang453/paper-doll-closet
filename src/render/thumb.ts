import { bodySkin, headSkin } from '../doll/body.ts';
import { HEAD_TRANSFORM } from '../doll/geometry.ts';
import { TEMPLATES } from '../items/templates.ts';
import type { Item } from '../items/types.ts';
import { inkDefs, renderItem } from './ink.ts';

/** A closet thumbnail: the item on a pale doll silhouette, cropped to the item. */
export function itemThumb(item: Item): string {
  const template = TEMPLATES[item.t];
  const pfx = `th-${item.id}`;
  const r = renderItem(item, pfx);
  return (
    `<svg viewBox="${template.thumb.join(' ')}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<defs>${inkDefs(pfx)}${r.defs}</defs>` +
    `<g class="ghost">${bodySkin('#000', 'none', true)}<g transform="${HEAD_TRANSFORM}">${headSkin('#000', 'none', true)}</g></g>` +
    r.svg +
    '</svg>'
  );
}
