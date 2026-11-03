/*
 * The ink style: muted flat colors, a hard-edged shadow band, ink fold lines,
 * ribbing on knits, and a filter that makes lines slightly wobbly with paper grain.
 */
import { mix, mute } from '../lib/color.ts';
import { HEAD_TRANSFORM } from '../doll/geometry.ts';
import { HEAD_SLOTS, TEMPLATES } from '../items/templates.ts';
import { patternDef } from '../items/patterns.ts';
import type { Item, StyleAttrs } from '../items/types.ts';

/** Shared filters, gradients and patterns. Ids are prefixed so several SVGs can share a page. */
export function inkDefs(pfx: string): string {
  return (
    `<filter id="${pfx}-white" x="0" y="0" width="100%" height="100%"><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>` +
    `<linearGradient id="${pfx}-cel" gradientUnits="userSpaceOnUse" x1="50" y1="0" x2="170" y2="0">` +
    '<stop offset="0" stop-color="#5A2E33" stop-opacity=".2"/><stop offset=".13" stop-color="#5A2E33" stop-opacity=".2"/><stop offset=".13" stop-color="#5A2E33" stop-opacity="0"/>' +
    '<stop offset=".69" stop-color="#5A2E33" stop-opacity="0"/><stop offset=".69" stop-color="#5A2E33" stop-opacity=".16"/><stop offset="1" stop-color="#5A2E33" stop-opacity=".16"/></linearGradient>' +
    `<pattern id="${pfx}-ribs" width="5" height="10" patternUnits="userSpaceOnUse"><path d="M2.5 0 V10" stroke="#3B2422" stroke-width=".9" opacity=".3"/></pattern>` +
    `<filter id="${pfx}-ink" filterUnits="userSpaceOnUse" x="-20" y="-10" width="260" height="580">` +
    '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="w"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="w" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="2" result="g"/>' +
    '<feColorMatrix in="g" type="saturate" values="0" result="gg"/>' +
    '<feComponentTransfer in="gg" result="g2"><feFuncR type="linear" slope=".3" intercept=".78"/><feFuncG type="linear" slope=".3" intercept=".78"/><feFuncB type="linear" slope=".3" intercept=".78"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>' +
    '<feBlend in="d" in2="g2" mode="multiply" result="b"/>' +
    '<feComposite in="b" in2="d" operator="in"/></filter>' +
    // The face gets only a light wobble so small features stay crisp.
    `<filter id="${pfx}-inkface" filterUnits="userSpaceOnUse" x="40" y="20" width="140" height="120">` +
    '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" seed="3" result="w"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="w" scale=".7" xChannelSelector="R" yChannelSelector="G"/></filter>'
  );
}

/** A mask in the exact shape of `silhouette`, so overlays never spill outside a garment. */
export const maskDef = (pfx: string, id: string, silhouette: string): string =>
  `<mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="0" width="260" height="560"><g filter="url(#${pfx}-white)">${silhouette}</g></mask>`;

/** A full-canvas rectangle filled with one of the shared paints, clipped by a mask. */
export const overlay = (pfx: string, paint: string, maskId: string): string =>
  `<rect x="-20" width="260" height="560" fill="url(#${pfx}-${paint})" mask="url(#${maskId})"/>`;

const styleAttrs = (strokeWidth: number): StyleAttrs => (fill, stroke, extra = '') =>
  `fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"${extra}`;

/** Draws one item in the ink style. Returns its defs (pattern, mask) and markup separately. */
export function renderItem(item: Item, pfx: string): { defs: string; svg: string } {
  const template = TEMPLATES[item.t];
  const id = `${pfx}-${item.id}`;
  const params = { ...item, color: mute(item.color), color2: mute(item.color2 || '#FAFAF5') };
  let defs = patternDef(id, params);
  const fill = defs ? `url(#${id})` : params.color;
  const stroke = mix(params.color, '#3B2422', 0.72);
  let svg = template.draw(params, fill, stroke, styleAttrs(1.9));

  const maskId = `${id}-m`;
  defs += maskDef(pfx, maskId, template.draw(params, '#fff', '#fff', styleAttrs(1.9)));
  if (template.knit) svg += overlay(pfx, 'ribs', maskId);
  svg += overlay(pfx, 'cel', maskId);
  if (template.folds)
    svg += `<g fill="none" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round" opacity=".8">${template.folds(params)}</g>`;

  if (HEAD_SLOTS.includes(template.slot)) svg = `<g transform="${HEAD_TRANSFORM}">${svg}</g>`;
  return { defs, svg };
}
