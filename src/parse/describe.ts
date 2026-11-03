/*
 * Turns a short description like "red plaid mini skirt" into item parameters.
 * This keyword parser stands in for a vision model, which would return the same fields
 * from a photo or a Pinterest pin.
 */
import { COLOR_WORDS } from '../data/palette.ts';
import { TEMPLATES } from '../items/templates.ts';
import type { Pattern, TemplateId } from '../items/types.ts';

export interface ParsedItem {
  type: TemplateId;
  name: string;
  color: string;
  color2: string;
  pattern: Pattern;
  length: number;
}

export type ParseResult = { ok: true; item: ParsedItem } | { ok: false; error: string };

// Checked in order, so more specific words come first.
const TYPE_RULES: Array<[RegExp, TemplateId]> = [
  [/cardigan/, 'cardigan'],
  [/jacket|blazer|coat|barn/, 'jacket'],
  [/sweater|knit|jumper|crewneck|hoodie/, 'sweater'],
  [/skirt/, 'skirt'],
  [/\bshorts?\b/, 'shorts'],
  [/pant|trouser|jean|slack/, 'trousers'],
  [/tank|cami/, 'tank'],
  [/tee|t-shirt|shirt|top|blouse/, 'tee'],
  [/boot/, 'boots'],
  [/sneaker|trainer/, 'sneakers'],
  [/mary jane|flat|heel|loafer|shoe/, 'maryjanes'],
  [/beret|hat/, 'beret'],
  [/bow|ribbon/, 'bow'],
  [/sunglass|shades|glasses/, 'sunglasses'],
  [/necklace|pearl|chain/, 'necklace'],
  [/bag|purse|tote/, 'bag'],
];

const WHITE = '#FAFAF5';
const NAVY = '#2A3D6E';

export function parseDescription(text: string): ParseResult {
  const s = ` ${text.toLowerCase()} `;
  const rule = TYPE_RULES.find(([re]) => re.test(s));
  if (!rule) {
    return { ok: false, error: "Couldn't tell what kind of item that is. Include a word like skirt, cardigan, tee or boots." };
  }
  const type = rule[1];
  const defaults = TEMPLATES[type].def;

  // Find color words in the order they appear, longest names first so
  // "butter yellow" wins over "yellow".
  const found: Array<[string, number]> = [];
  let rest = s;
  for (const word of Object.keys(COLOR_WORDS).sort((a, b) => b.length - a.length)) {
    const re = new RegExp(`\\b${word}\\b`);
    const m = rest.match(re);
    if (m && m.index !== undefined) {
      found.push([COLOR_WORDS[word], m.index]);
      rest = rest.replace(re, ' '.repeat(word.length));
    }
  }
  const colors = found.sort((a, b) => a[1] - b[1]).map(([c]) => c);

  let pattern: Pattern = 'solid';
  if (/stripe|breton/.test(s)) pattern = 'stripes';
  else if (/polka|dot/.test(s)) pattern = 'dots';
  else if (/plaid|tartan|check|gingham/.test(s)) pattern = 'plaid';

  const color = colors[0] ?? defaults.color;
  let color2 = defaults.color2;
  if (colors[1]) color2 = colors[1];
  else if (pattern !== 'solid') color2 = color === WHITE ? NAVY : WHITE;

  let length = defaults.length;
  if (/\bmini\b|cropped|short\b|ankle boot|bootie/.test(s)) length = type === 'trousers' ? 20 : 8;
  else if (/midi|knee/.test(s)) length = type === 'boots' ? 75 : 55;
  else if (/maxi|\blong\b|duster|thigh/.test(s)) length = 95;
  if (type === 'trousers') {
    if (/wide|flare|baggy/.test(s)) length = 100;
    else if (/skinny|slim|straight/.test(s)) length = 8;
  }

  const trimmed = text.trim().replace(/\s+/g, ' ').slice(0, 28);
  const name = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return { ok: true, item: { type, name, color, color2, pattern, length } };
}
