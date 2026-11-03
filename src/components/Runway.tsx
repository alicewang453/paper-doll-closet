import { useMemo } from 'react';
import type { Avatar, Item, Worn } from '../items/types.ts';
import { dollSvg } from '../render/doll.ts';
import { Art } from './Window.tsx';

export interface SavedLook {
  avatar: Avatar;
  worn: Worn;
  items: Item[];
}

export function Runway({
  avatar,
  worn,
  items,
  labels,
  saved,
  onToggleLabels,
  onShuffle,
  onUndress,
  onSave,
  onLoad,
}: {
  avatar: Avatar;
  worn: Worn;
  items: Item[];
  labels: boolean;
  saved: SavedLook[];
  onToggleLabels: () => void;
  onShuffle: () => void;
  onUndress: () => void;
  onSave: () => void;
  onLoad: (look: SavedLook) => void;
}) {
  const svg = useMemo(() => dollSvg(avatar, worn, items, { idPrefix: 'st', labels }), [avatar, worn, items, labels]);
  return (
    <>
      <div className="stage">
        <div className="stage-toggle">
          <button type="button" className="chip" aria-pressed={labels} onClick={onToggleLabels}>
            Labels
          </button>
        </div>
        <Art svg={svg} className={`stage-art ${labels ? 'wide' : ''}`} />
      </div>
      <div className="stage-actions">
        <button type="button" className="btn primary" onClick={onShuffle}>Shuffle outfit</button>
        <button type="button" className="btn" onClick={onUndress}>Undress</button>
        <button type="button" className="btn" onClick={onSave}>Save look</button>
      </div>
      {saved.length ? (
        <div className="saved">
          {saved.map((look, i) => (
            <button key={i} type="button" aria-label={`Load saved look ${i + 1}`} onClick={() => onLoad(look)}>
              <Art svg={dollSvg(look.avatar, look.worn, look.items, { idPrefix: `sv${i}`, label: `Saved look ${i + 1}` })} />
            </button>
          ))}
        </div>
      ) : (
        <p className="saved-empty">Saved looks show up here.</p>
      )}
    </>
  );
}
