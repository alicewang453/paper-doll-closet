import { HEAD_TRANSFORM, FOOT_OUTLINE, armSegment, mirror, torsoPath } from './geometry.ts';

/** Legs, arms, neck and torso. ghost=true draws a flat silhouette for closet thumbnails. */
export function bodySkin(skin: string, stroke: string, ghost = false): string {
  const solid = ghost ? ' class="solid"' : '';
  const leg =
    `<path${solid} d="M82 250 L108 250 L104 520 L88 520 Z" fill="${skin}" stroke="${stroke}" stroke-width="1.2"/>` +
    `<path${solid} d="M87.4 508 ${FOOT_OUTLINE} 104.4 508 Z" fill="${skin}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>`;
  const arm =
    armSegment(1, 14, skin, stroke, ghost) +
    `<ellipse${solid} cx="60" cy="295" rx="7" ry="9" fill="${skin}" stroke="${stroke}" stroke-width="1.2"/>`;
  return (
    mirror(leg) +
    mirror(arm) +
    `<rect${solid} x="102" y="98" width="16" height="36" fill="${skin}" stroke="${stroke}" stroke-width="1.2"/>` +
    `<path${solid} d="${torsoPath(256, 'skin')}" fill="${skin}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>`
  );
}

/** Ears and face shape, drawn in head coordinates (wrap in HEAD_TRANSFORM). */
export function headSkin(skin: string, stroke: string, ghost = false): string {
  const solid = ghost ? ' class="solid"' : '';
  return (
    mirror(`<ellipse${solid} cx="79" cy="80" rx="5" ry="8" fill="${skin}" stroke="${stroke}" stroke-width="1.2"/>`) +
    `<path${solid} d="M78 70 Q78 30 110 30 Q142 30 142 70 Q142 90 131 102 Q119 114 110 115 Q101 114 89 102 Q78 90 78 70 Z" fill="${skin}" stroke="${stroke}" stroke-width="1.2"/>`
  );
}

/** A simple camisole and shorts shown when nothing is worn on top or bottom. */
export const BASE_TOP = '<path d="M80 150 Q110 157 140 150 L139 172 Q110 177 81 172 Z" fill="#E7E1F0" stroke="#B3A8C7" stroke-width="1.2"/>';
export const BASE_BOTTOM = '<path d="M84 212 L136 212 L140 250 L112 252 L110 258 L108 252 L80 250 Z" fill="#E7E1F0" stroke="#B3A8C7" stroke-width="1.2"/>';

export { HEAD_TRANSFORM };
