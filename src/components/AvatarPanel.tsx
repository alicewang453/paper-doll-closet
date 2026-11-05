import { EYE_COLORS, HAIR_COLORS, HAIR_STYLES, HAIR_TEXTURES, LIP_COLORS, SKIN_TONES } from '../data/palette.ts';
import type { Avatar, HairStyle, HairTexture } from '../items/types.ts';
import { Swatches } from './Swatches.tsx';

const SKINS = Object.fromEntries(SKIN_TONES.map((c, i) => [`tone ${i + 1}`, c]));

export function AvatarPanel({ avatar, onChange }: { avatar: Avatar; onChange: (patch: Partial<Avatar>) => void }) {
  return (
    <div className="pad">
      <div>
        <p className="label">Skin</p>
        <Swatches colors={SKINS} value={avatar.skin} onPick={(skin) => onChange({ skin })} />
      </div>
      <div>
        <p className="label">Hair style</p>
        <div className="seg">
          {(Object.entries(HAIR_STYLES) as Array<[HairStyle, string]>).map(([style, label]) => (
            <button
              key={style}
              type="button"
              className="chip"
              aria-pressed={avatar.hairStyle === style}
              onClick={() => onChange({ hairStyle: style })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Hair texture</p>
        <div className="seg">
          {(Object.entries(HAIR_TEXTURES) as Array<[HairTexture, string]>).map(([texture, label]) => (
            <button
              key={texture}
              type="button"
              className="chip"
              aria-pressed={avatar.hairTexture === texture}
              onClick={() => onChange({ hairTexture: texture })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Hair color</p>
        <Swatches colors={HAIR_COLORS} value={avatar.hair} onPick={(hair) => onChange({ hair })} />
      </div>
      <div>
        <p className="label">Eyes</p>
        <Swatches colors={EYE_COLORS} value={avatar.eyes} onPick={(eyes) => onChange({ eyes })} />
      </div>
      <div>
        <p className="label">Lips</p>
        <Swatches colors={LIP_COLORS} value={avatar.lips} onPick={(lips) => onChange({ lips })} />
      </div>
    </div>
  );
}
