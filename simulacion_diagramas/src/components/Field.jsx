export default function Field({ label, children }) {
  return (
    <label className="grid grid-cols-2 md:grid-cols-3 items-center gap-2 py-1 text-sm">
      <span className="text-zinc-300">{label}</span>
      <span className="md:col-span-2">{children}</span>
    </label>
  );
}
