export default function Field({ label, children, error }) {
  return (
    <label className="block mb-3">
      <div className="mb-1 text-sm text-zinc-400">{label}</div>
      {children}
      {error ? (
        <div className="mt-1 text-xs text-red-400">{error}</div>
      ) : null}
    </label>
  );
}