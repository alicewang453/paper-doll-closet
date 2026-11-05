import { useCallback, useEffect, useState } from 'react';
import { AvatarPanel } from './components/AvatarPanel.tsx';
import { Closet } from './components/Closet.tsx';
import { Runway } from './components/Runway.tsx';
import type { SavedLook } from './components/Runway.tsx';
import { Window } from './components/Window.tsx';
import { STARTER_AVATAR, makeItem, starterCloset } from './data/starter.ts';
import { TEMPLATES } from './items/templates.ts';
import type { Avatar, Item, ItemParams, Slot, Tab, Worn } from './items/types.ts';
import type { ParsedItem } from './parse/describe.ts';

const SAVED_KEY = 'paper-doll-closet:saved-looks';
const MAX_SAVED = 8;

function loadSaved(): SavedLook[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? (parsed as SavedLook[]).slice(0, MAX_SAVED).map((look) => ({ ...look, avatar: upgradeAvatar(look.avatar) }))
      : [];
  } catch {
    return [];
  }
}

/** Converts avatars saved before hair texture existed ('bob' and 'curly' were styles then). */
function upgradeAvatar(avatar: Avatar): Avatar {
  const old = avatar.hairStyle as string;
  if (avatar.hairTexture) return avatar;
  if (old === 'bob') return { ...avatar, hairStyle: 'short', hairTexture: 'straight' };
  if (old === 'curly') return { ...avatar, hairStyle: 'medium', hairTexture: 'curly' };
  return { ...avatar, hairTexture: 'straight' };
}

const slotOf = (item: Item): Slot => TEMPLATES[item.t].slot;
const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export default function App() {
  const [avatar, setAvatar] = useState<Avatar>(STARTER_AVATAR);
  const [items, setItems] = useState<Item[]>(() => starterCloset().items);
  const [worn, setWorn] = useState<Worn>(() => starterCloset().worn);
  const [selectedId, setSelectedId] = useState<string | null>('s2');
  const [tab, setTab] = useState<Tab>('tops');
  const [labels, setLabels] = useState(true);
  const [saved, setSaved] = useState<SavedLook[]>(loadSaved);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch {
      // Storage can be unavailable (private windows); saved looks just won't persist.
    }
  }, [saved]);

  const isWorn = useCallback((item: Item) => worn[slotOf(item)] === item.id, [worn]);

  const wear = (item: Item) => setWorn((w) => ({ ...w, [slotOf(item)]: item.id }));
  const takeOff = (item: Item) =>
    setWorn((w) => {
      const next = { ...w };
      delete next[slotOf(item)];
      return next;
    });

  const updateItem = (id: string, patch: Partial<ItemParams>) =>
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const shuffle = () => {
    const bySlot = (slot: Slot) => items.filter((i) => slotOf(i) === slot);
    const next: Worn = {};
    for (const slot of ['top', 'bottom', 'shoes'] as Slot[]) {
      const options = bySlot(slot);
      if (options.length) next[slot] = pick(options).id;
    }
    if (Math.random() < 0.5 && bySlot('outer').length) next.outer = pick(bySlot('outer')).id;
    for (const slot of ['head', 'eyes', 'neck', 'bag'] as Slot[]) {
      if (Math.random() < 0.3 && bySlot(slot).length) next[slot] = pick(bySlot(slot)).id;
    }
    setWorn(next);
    setSelectedId(null);
  };

  const saveLook = () => {
    const wornIds = Object.values(worn);
    const look: SavedLook = { avatar, worn, items: items.filter((i) => wornIds.includes(i.id)) };
    setSaved((list) => [look, ...list].slice(0, MAX_SAVED));
  };

  const loadLook = (look: SavedLook) => {
    setAvatar(look.avatar);
    setItems((list) => {
      const next = [...list];
      for (const item of look.items) {
        const i = next.findIndex((x) => x.id === item.id);
        if (i >= 0) next[i] = item;
        else next.push(item);
      }
      return next;
    });
    setWorn(look.worn);
    setSelectedId(null);
  };

  const createFromDescription = (parsed: ParsedItem) => {
    const item = makeItem(parsed.type, parsed.name, {
      color: parsed.color,
      color2: parsed.color2,
      pattern: parsed.pattern,
      length: parsed.length,
    });
    setItems((list) => [...list, item]);
    wear(item);
    setSelectedId(item.id);
    setTab(TEMPLATES[item.t].tab);
  };

  return (
    <div className="wrap">
      <header>
        <h1>
          Paper Doll <span>Closet</span>
        </h1>
        <p className="tag">
          Dress the doll from the closet, change any item's color, pattern or fit, or describe a new piece. Every item is
          drawn from a few parameters, so it always fits.
        </p>
      </header>
      <div className="app">
        <Window title="Make me" className="avatar">
          <AvatarPanel avatar={avatar} onChange={(patch) => setAvatar((a) => ({ ...a, ...patch }))} />
        </Window>
        <Window title="Runway" className="stagewin">
          <Runway
            avatar={avatar}
            worn={worn}
            items={items}
            labels={labels}
            saved={saved}
            onToggleLabels={() => setLabels((l) => !l)}
            onShuffle={shuffle}
            onUndress={() => setWorn({})}
            onSave={saveLook}
            onLoad={loadLook}
          />
        </Window>
        <Window title="Closet" className="wardrobe">
          <Closet
            items={items}
            tab={tab}
            selectedId={selectedId}
            isWorn={isWorn}
            onTab={setTab}
            onPick={(item) => {
              if (!isWorn(item)) wear(item);
              setSelectedId(item.id);
            }}
            onChange={updateItem}
            onToggleWorn={(item) => (isWorn(item) ? takeOff(item) : wear(item))}
            onCreate={createFromDescription}
          />
        </Window>
      </div>
      <footer className="credits">
        Made by Alice Wang ·{' '}
        <a href="https://github.com/alicewang453/paper-doll-closet" target="_blank" rel="noreferrer">
          Source on GitHub
        </a>
      </footer>
    </div>
  );
}
