export default function Table({ cols, rows }) {
  return (
    <div className="overflow-auto rounded-xl border border-zinc-800">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-900">
          <tr>
            {cols.map((c, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-zinc-300">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(!rows || rows.length === 0) && (
            <tr>
              <td colSpan={cols.length} className="px-3 py-6 text-center text-zinc-500">
                Sin resultados aún
              </td>
            </tr>
          )}
          {rows?.map((r, ri) => (
            <tr key={ri} className={ri % 2 ? "bg-zinc-950" : ""}>
              {r.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-zinc-200 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
