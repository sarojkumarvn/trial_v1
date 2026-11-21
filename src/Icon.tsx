const paths: Record<string, string> = {
  code: "M8 6l-6 6 6 6m8-12 6 6-6 6m-3-15-3 18",
  database:
    "M3 6c0-5 18-5 18 0s-18 5-18 0zm0 0v12c0 5 18 5 18 0V6M3 12c0 5 18 5 18 0",
  shield: "M12 2l8 3v6q0 7-8 11-8-4-8-11V5z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  folder: "M2 6h7l2 2h11v12H2z",
  check: "M4 12l5 5L20 6",
  layers: "M2 8l10-5 10 5-10 5zM2 12l10 5 10-5M2 16l10 5 10-5",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  calendar: "M3 5h18v16H3zM7 2v6m10-6v6M3 11h18",
  pulse: "M2 12h5l3-7 4 14 3-7h5",
  person: "M8 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0M4 21v-2a8 7 0 0 1 16 0v2",
  brief: "M5 2h9l5 5v15H5zM14 2v6h5M8 13h8m-8 4h6",
};
export function Icon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">
      <path d={paths[name]} />
    </svg>
  );
}
