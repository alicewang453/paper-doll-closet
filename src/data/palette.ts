import type { HairStyle, HairTexture } from '../items/types.ts';

/** Colors offered in the item editor. */
export const SWATCHES: Record<string, string> = {
  'butter yellow': '#F3DE8A', cream: '#F2EAD3', white: '#FAFAF5', black: '#2A2730', grey: '#9C9AA6',
  navy: '#2A3D6E', denim: '#5E7FB3', sky: '#9CC7E8', sage: '#A9C0A0', olive: '#6F7547', camel: '#C49A6C',
  brown: '#7A4E2D', burgundy: '#6E2035', red: '#C93A4C', pink: '#F2A9C4', lavender: '#BBA8E6',
  orange: '#E8894A', mint: '#9FDCC8',
};

/** Every color word the description parser understands. */
export const COLOR_WORDS: Record<string, string> = {
  ...SWATCHES,
  yellow: '#EDCB4E', blue: '#4F78C4', green: '#5F9A63', purple: '#8A63C9', tan: '#C49A6C',
  chocolate: '#7A4E2D', ivory: '#F2EAD3', charcoal: '#4A4852', silver: '#C9CBD3', gold: '#D4AE4E',
  cherry: '#C93A4C', pearl: '#FAFAF5', gray: '#9C9AA6', khaki: '#BFAE82', rust: '#A8502E',
  lilac: '#BBA8E6', forest: '#3E6B4A', baby: '#9CC7E8',
};

export const SKIN_TONES = ['#FBE3D3', '#F3CDB0', '#E3AE88', '#C98E63', '#A06A44', '#7A4B2E', '#56331F'];

export const HAIR_COLORS: Record<string, string> = {
  black: '#1F1A1C', 'dark brown': '#4A2E22', brown: '#7B4A2C', auburn: '#9C3F22', blonde: '#E2C27A',
  platinum: '#EDE3C8', pink: '#F08FB4', lavender: '#A88FD8', teal: '#3FA39A',
};

export const EYE_COLORS: Record<string, string> = {
  brown: '#6B4226', hazel: '#8A7A3A', green: '#4F8A5B', blue: '#4D7BB8', grey: '#7B8794',
};

export const LIP_COLORS: Record<string, string> = {
  rose: '#D9707F', berry: '#C2505F', nude: '#B5655A', pink: '#E89AA4', plum: '#8E3B4E',
};

export const HAIR_STYLES: Record<HairStyle, string> = { short: 'Short', medium: 'Medium', long: 'Long', bun: 'Bun' };

export const HAIR_TEXTURES: Record<HairTexture, string> = { straight: 'Straight', wavy: 'Wavy', curly: 'Curly' };
