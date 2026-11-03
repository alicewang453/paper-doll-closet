import { useState } from 'react';
import { parseDescription } from '../parse/describe.ts';
import type { ParsedItem } from '../parse/describe.ts';

const EXAMPLES = [
  'butter yellow cropped cardigan',
  'brown suede knee boots',
  'red plaid mini skirt',
  'navy and white striped tee',
  'burgundy beret',
  'olive wide-leg trousers',
];

/** Makes a new closet item from a short description. */
export function DescribeBox({ onCreate }: { onCreate: (item: ParsedItem) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [last, setLast] = useState<ParsedItem | null>(null);

  const make = (description: string) => {
    const result = parseDescription(description);
    if (!result.ok) {
      setError(result.error);
      setLast(null);
      return;
    }
    setError('');
    setLast(result.item);
    onCreate(result.item);
  };

  return (
    <div className="gen">
      <p className="label">New item from a description</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) make(text);
        }}
      >
        <input
          id="describe"
          type="text"
          value={text}
          placeholder="e.g. red plaid mini skirt"
          aria-label="Describe a clothing item"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn primary">Make it</button>
      </form>
      <div className="seg">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="chip"
            onClick={() => {
              setText(example);
              make(example);
            }}
          >
            {example}
          </button>
        ))}
      </div>
      {error ? (
        <p className="err">{error}</p>
      ) : last ? (
        <>
          <p className="note">Fields the parser returned. The doll draws the item from these, so it always fits.</p>
          <pre>{JSON.stringify({ type: last.type, color: last.color, pattern: last.pattern, color2: last.color2, length: last.length }, null, 2)}</pre>
        </>
      ) : (
        <p className="note">
          In the full app, a vision model reads a pin or photo and returns structured fields like these. Here a simple
          keyword parser stands in for it.
        </p>
      )}
    </div>
  );
}
