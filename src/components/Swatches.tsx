export function Swatches({
  colors,
  value,
  onPick,
}: {
  colors: Record<string, string>;
  value: string;
  onPick: (color: string) => void;
}) {
  return (
    <div className="swatches">
      {Object.entries(colors).map(([name, color]) => (
        <button
          key={name}
          type="button"
          className="sw"
          style={{ background: color }}
          title={name}
          aria-label={name}
          aria-pressed={value === color}
          onClick={() => onPick(color)}
        />
      ))}
    </div>
  );
}
