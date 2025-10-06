export default function Button({ children, onClick, variant = "primary" }) {
  const cls =
    variant === "primary"
      ? "bg-emerald-600 hover:bg-emerald-500"
      : "bg-zinc-800 hover:bg-zinc-700";
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition active:scale-[.98] disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
  );
}
