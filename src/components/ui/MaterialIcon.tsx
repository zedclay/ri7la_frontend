type Props = {
  name: string;
  className?: string;
  filled?: boolean;
};

/** Google Material Symbols Outlined — load font in root layout */
export function MaterialIcon({ name, className = "", filled = false }: Props) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={
        filled
          ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
          : undefined
      }
      aria-hidden
    >
      {name}
    </span>
  );
}
