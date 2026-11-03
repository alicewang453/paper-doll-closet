import { describe, expect, it } from 'vitest';
import { STARTER_AVATAR, starterCloset } from '../data/starter.ts';
import { TEMPLATES } from '../items/templates.ts';
import type { Slot, Worn } from '../items/types.ts';
import { dollSvg, wrapWords } from './doll.ts';

describe('dollSvg', () => {
  it('draws every starter item without broken values or duplicate ids', () => {
    const { items } = starterCloset();
    // Wear one item per slot, cycling through the closet.
    const worn: Worn = {};
    for (const item of items) worn[TEMPLATES[item.t].slot as Slot] = item.id;
    const svg = dollSvg(STARTER_AVATAR, worn, items, { idPrefix: 'test', labels: true });
    expect(svg).not.toMatch(/NaN|undefined/);
    const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    // Every referenced id is defined.
    for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) expect(ids).toContain(ref);
  });

  it('shows the base outfit when nothing is worn', () => {
    const svg = dollSvg(STARTER_AVATAR, {}, [], { idPrefix: 'empty' });
    expect(svg).toContain('#E7E1F0');
  });

  it('escapes item names in labels', () => {
    const { items } = starterCloset();
    items[0].name = 'Tee <b>"bold"</b>';
    const svg = dollSvg(STARTER_AVATAR, { top: items[0].id }, items, { idPrefix: 'esc', labels: true });
    expect(svg).not.toContain('<b>');
  });
});

describe('wrapWords', () => {
  it('wraps long labels onto at most three lines', () => {
    expect(wrapWords('butter yellow cropped cardigan', 11)).toEqual(['butter', 'yellow', 'cropped']);
    expect(wrapWords('beret', 11)).toEqual(['beret']);
  });
});
