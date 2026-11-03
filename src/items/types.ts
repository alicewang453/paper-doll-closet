export type Pattern = 'solid' | 'stripes' | 'dots' | 'plaid';
export type Slot = 'top' | 'outer' | 'bottom' | 'shoes' | 'head' | 'eyes' | 'neck' | 'bag';
export type Tab = 'tops' | 'bottoms' | 'shoes' | 'extras';
export type TemplateId =
  | 'tee' | 'sweater' | 'tank' | 'cardigan' | 'jacket'
  | 'skirt' | 'trousers' | 'shorts'
  | 'sneakers' | 'boots' | 'maryjanes'
  | 'beret' | 'bow' | 'sunglasses' | 'necklace' | 'bag';

/** The adjustable parameters every item is drawn from. */
export interface ItemParams {
  color: string;
  color2: string;
  pattern: Pattern;
  /** 0 to 100. What it controls depends on the template (length, leg width, boot height). */
  length: number;
}

export interface Item extends ItemParams {
  id: string;
  t: TemplateId;
  name: string;
}

/** Builds the shared fill/stroke attributes for a template's main shapes. */
export type StyleAttrs = (fill: string, stroke: string, extra?: string) => string;

export interface Template {
  label: string;
  slot: Slot;
  tab: Tab;
  /** SVG viewBox (x, y, width, height) used for the closet thumbnail. */
  thumb: [number, number, number, number];
  /** Label for the length slider, if the template has one. */
  shape?: string;
  /** Whether the second color is used even when the pattern is solid (trim, buttons). */
  usesColor2?: boolean;
  /** Knits get ribbing drawn over them. */
  knit?: boolean;
  def: ItemParams;
  /** Draws the item in doll coordinates. F is the fill (color or pattern), S the outline color. */
  draw: (p: ItemParams, F: string, S: string, st: StyleAttrs) => string;
  /** Fold and crease lines, drawn as ink over the item. */
  folds?: (p: ItemParams) => string;
}

export type Worn = Partial<Record<Slot, string>>;

export type HairStyle = 'long' | 'bob' | 'bun' | 'curly';

export interface Avatar {
  skin: string;
  hairStyle: HairStyle;
  hair: string;
  eyes: string;
  lips: string;
}
