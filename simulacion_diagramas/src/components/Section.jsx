export default function Section({ title, children, right }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {right}
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm">
        {children}
      </div>
    </div>
  );
}
