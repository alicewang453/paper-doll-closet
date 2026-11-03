import { describe, expect, it } from 'vitest';
import { COLOR_WORDS } from '../data/palette.ts';
import { parseDescription } from './describe.ts';

const parse = (text: string) => {
  const r = parseDescription(text);
  if (!r.ok) throw new Error(r.error);
  return r.item;
};

describe('parseDescription', () => {
  it('reads type, color, pattern and length', () => {
    const item = parse('red plaid mini skirt');
    expect(item).toMatchObject({ type: 'skirt', color: COLOR_WORDS.red, pattern: 'plaid', length: 8 });
  });

  it('prefers multi-word colors over the words inside them', () => {
    const item = parse('butter yellow cropped cardigan');
    expect(item).toMatchObject({ type: 'cardigan', color: COLOR_WORDS['butter yellow'], length: 8 });
  });

  it('uses the second color for the pattern', () => {
    const item = parse('navy and white striped tee');
    expect(item).toMatchObject({ type: 'tee', pattern: 'stripes', color: COLOR_WORDS.navy, color2: COLOR_WORDS.white });
  });

  it('understands boot height and trouser width', () => {
    expect(parse('brown suede knee boots')).toMatchObject({ type: 'boots', color: COLOR_WORDS.brown, length: 75 });
    expect(parse('olive wide-leg trousers')).toMatchObject({ type: 'trousers', color: COLOR_WORDS.olive, length: 100 });
    expect(parse('black skinny jeans')).toMatchObject({ type: 'trousers', length: 8 });
  });

  it('checks specific item words before general ones', () => {
    expect(parse('cream knit cardigan').type).toBe('cardigan');
    expect(parse('denim jacket').type).toBe('jacket');
  });

  it('names the item after the description', () => {
    expect(parse('  burgundy   beret ').name).toBe('Burgundy beret');
  });

  it('explains what to add when it does not recognize the item', () => {
    const r = parseDescription('something cozy');
    expect(r.ok).toBe(false);
  });
});
