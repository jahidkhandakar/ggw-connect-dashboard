export function ComingSoon({ title, next }: { title: string; next?: boolean }) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-navy mb-2">{title}</h1>
      <div className="card">
        <p className="text-navy/70">
          {next
            ? "This is the next tool to build — the drag-and-drop tee-sheet builder, sized for a monitor."
            : "Planned creator tool. Coming in a later iteration."}
        </p>
        <p className="text-navy/50 text-sm mt-3">
          Build order (spec §14): Tournament creation → Tee-Sheet Builder → Sim
          Board → Flight Management → Private-Club Members.
        </p>
      </div>
    </div>
  );
}
