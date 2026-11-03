import { useMemo } from 'react';
import { TEMPLATES } from '../items/templates.ts';
import type { Item, ItemParams, Tab } from '../items/types.ts';
import type { ParsedItem } from '../parse/describe.ts';
import { itemThumb } from '../render/thumb.ts';
import { Art } from './Window.tsx';
import { DescribeBox } from './DescribeBox.tsx';
import { ItemEditor } from './ItemEditor.tsx';

const TABS: Record<Tab, string> = { tops: 'Tops', bottoms: 'Bottoms', shoes: 'Shoes', extras: 'Extras' };

function Tile({ item, worn, selected, onClick }: { item: Item; worn: boolean; selected: boolean; onClick: () => void }) {
  const svg = useMemo(() => itemThumb(item), [item]);
  return (
    <button
      type="button"
      className="tile"
      data-worn={worn}
      data-sel={selected}
      aria-label={`${item.name}${worn ? ', wearing' : ''}`}
      onClick={onClick}
    >
      {worn && <span className="on">ON</span>}
      <Art svg={svg} className="tile-art" />
      <span>{item.name}</span>
    </button>
  );
}

export function Closet({
  items,
  tab,
  selectedId,
  isWorn,
  onTab,
  onPick,
  onChange,
  onToggleWorn,
  onCreate,
}: {
  items: Item[];
  tab: Tab;
  selectedId: string | null;
  isWorn: (item: Item) => boolean;
  onTab: (tab: Tab) => void;
  onPick: (item: Item) => void;
  onChange: (id: string, patch: Partial<ItemParams>) => void;
  onToggleWorn: (item: Item) => void;
  onCreate: (parsed: ParsedItem) => void;
}) {
  const selected = items.find((i) => i.id === selectedId);
  return (
    <div className="pad">
      <div className="tabs">
        {(Object.entries(TABS) as Array<[Tab, string]>).map(([key, label]) => (
          <button key={key} type="button" className="chip" aria-pressed={tab === key} onClick={() => onTab(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid">
        {items
          .filter((i) => TEMPLATES[i.t].tab === tab)
          .map((item) => (
            <Tile key={item.id} item={item} worn={isWorn(item)} selected={item.id === selectedId} onClick={() => onPick(item)} />
          ))}
      </div>
      <ItemEditor
        item={selected}
        worn={selected ? isWorn(selected) : false}
        onChange={(patch) => selected && onChange(selected.id, patch)}
        onToggleWorn={() => selected && onToggleWorn(selected)}
      />
      <DescribeBox onCreate={onCreate} />
    </div>
  );
}
