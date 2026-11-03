import { SWATCHES } from '../data/palette.ts';
import { PATTERNS } from '../items/patterns.ts';
import { TEMPLATES } from '../items/templates.ts';
import type { Item, ItemParams } from '../items/types.ts';
import { Swatches } from './Swatches.tsx';

export function ItemEditor({
  item,
  worn,
  onChange,
  onToggleWorn,
}: {
  item: Item | undefined;
  worn: boolean;
  onChange: (patch: Partial<ItemParams>) => void;
  onToggleWorn: () => void;
}) {
  if (!item) return <p className="muted">Tap an item to put it on and edit its color, pattern and fit.</p>;
  const template = TEMPLATES[item.t];
  const showColor2 = item.pattern !== 'solid' || template.usesColor2;
  return (
    <div className="editor">
      <div className="row editor-head">
        <h3>{item.name}</h3>
        <button type="button" className={`btn ${worn ? '' : 'primary'}`} onClick={onToggleWorn}>
          {worn ? 'Take off' : 'Put on'}
        </button>
      </div>
      <div>
        <p className="label">Color</p>
        <div className="swatch-row">
          <Swatches colors={SWATCHES} value={item.color} onPick={(color) => onChange({ color })} />
          <input
            id="custom-color"
            type="color"
            value={item.color}
            aria-label="Custom color"
            onChange={(e) => onChange({ color: e.target.value })}
          />
        </div>
      </div>
      <div>
        <p className="label">Pattern</p>
        <div className="seg">
          {PATTERNS.map((pattern) => (
            <button
              key={pattern}
              type="button"
              className="chip"
              aria-pressed={item.pattern === pattern}
              onClick={() => onChange({ pattern })}
            >
              {pattern}
            </button>
          ))}
        </div>
      </div>
      {showColor2 && (
        <div>
          <p className="label">{item.pattern !== 'solid' ? 'Pattern color' : 'Trim color'}</p>
          <Swatches colors={SWATCHES} value={item.color2} onPick={(color2) => onChange({ color2 })} />
        </div>
      )}
      {template.shape && (
        <div>
          <label className="label" htmlFor="shape">{template.shape}</label>
          <input
            id="shape"
            type="range"
            min={0}
            max={100}
            value={item.length}
            onChange={(e) => onChange({ length: Number(e.target.value) })}
          />
        </div>
      )}
    </div>
  );
}
