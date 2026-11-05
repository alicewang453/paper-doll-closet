import { TEMPLATES } from '../items/templates.ts';
import type { Avatar, Item, ItemParams, TemplateId, Worn } from '../items/types.ts';

let counter = 0;

/** A fresh id that won't clash with starter items or ones loaded from saved looks. */
export const newItemId = (): string => `i${Date.now().toString(36)}${(counter++).toString(36)}`;

export function makeItem(t: TemplateId, name: string, overrides: Partial<ItemParams> = {}, id = newItemId()): Item {
  return { id, t, name, ...TEMPLATES[t].def, ...overrides };
}

export const STARTER_AVATAR: Avatar = {
  skin: '#F3CDB0',
  hairStyle: 'long',
  hairTexture: 'straight',
  hair: '#4A2E22',
  eyes: '#6B4226',
  lips: '#D9707F',
};

export function starterCloset(): { items: Item[]; worn: Worn } {
  const items: Item[] = [
    makeItem('tee', 'Breton tee', { pattern: 'stripes', color: '#FAFAF5', color2: '#2A3D6E' }, 's1'),
    makeItem('sweater', 'Grey crewneck', {}, 's2'),
    makeItem('tank', 'Cherry tank', {}, 's3'),
    makeItem('cardigan', 'Butter cardigan', {}, 's4'),
    makeItem('jacket', 'Barn jacket', {}, 's5'),
    makeItem('skirt', 'Plaid mini', {}, 's6'),
    makeItem('trousers', 'Wide-leg denim', {}, 's7'),
    makeItem('skirt', 'Black midi', { color: '#2A2730', pattern: 'solid', length: 70 }, 's8'),
    makeItem('shorts', 'Sage shorts', {}, 's9'),
    makeItem('sneakers', 'White sneakers', {}, 's10'),
    makeItem('boots', 'Knee boots', {}, 's11'),
    makeItem('maryjanes', 'Mary Janes', {}, 's12'),
    makeItem('beret', 'Beret', {}, 's13'),
    makeItem('bow', 'Pink bow', {}, 's14'),
    makeItem('sunglasses', 'Sunglasses', {}, 's15'),
    makeItem('necklace', 'Pearls', {}, 's16'),
    makeItem('bag', 'Shoulder bag', {}, 's17'),
  ];
  return { items, worn: { top: 's2', bottom: 's6', shoes: 's11', head: 's13', bag: 's17' } };
}
