import type { ItemParams, Pattern } from './types.ts';

export const PATTERNS: Pattern[] = ['solid', 'stripes', 'dots', 'plaid'];

/** An SVG <pattern> fill for an item, or an empty string for solid colors. */
export function patternDef(id: string, p: ItemParams): string {
  const c = p.color;
  const c2 = p.color2 || '#FAFAF5';
  if (p.pattern === 'stripes')
    return `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${c}"/><rect width="10" height="4" fill="${c2}"/></pattern>`;
  if (p.pattern === 'dots')
    return `<pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${c}"/><circle cx="3" cy="3" r="1.9" fill="${c2}"/><circle cx="9" cy="9" r="1.9" fill="${c2}"/></pattern>`;
  if (p.pattern === 'plaid')
    return `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${c}"/><rect y="5" width="16" height="4" fill="${c2}" opacity=".55"/><rect x="5" width="4" height="16" fill="${c2}" opacity=".55"/><path d="M0 13 H16 M13 0 V16" stroke="${c2}" stroke-width=".8" opacity=".8"/></pattern>`;
  return '';
}
