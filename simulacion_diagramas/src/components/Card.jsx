export default function Card({ label, value }) {
  return (
    <div className="rounded-xl bg-zinc-900 p-4 border border-zinc-800">
      <div className="text-zinc-400">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}