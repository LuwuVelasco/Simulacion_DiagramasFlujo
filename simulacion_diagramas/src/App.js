import { useMemo, useState } from "react";
import ModDice from "./modules/ModDice";
import ModHen from "./modules/ModHen";
import ModStore from "./modules/ModStore";
import ModInterestFixed from "./modules/ModInterestFixed";
import ModInterestVariable from "./modules/ModInterestVariable";
import ModInventory from "./modules/ModInventory";

const MODS = [
  { key: "dados", label: "Lanzamiento de Dados", comp: ModDice, emoji: "🎲" },
  { key: "gallina", label: "Gallina Pone Huevos", comp: ModHen, emoji: "🐔" },
  { key: "tienda", label: "Tienda: Llegada & Venta", comp: ModStore, emoji: "🛒" },
  { key: "interes_fijo", label: "Interés Fijo", comp: ModInterestFixed, emoji: "💰" },
  { key: "interes_var", label: "Interés Variable", comp: ModInterestVariable, emoji: "📈" },
  { key: "inventario", label: "Inventario de Azúcar", comp: ModInventory, emoji: "🏭" },
];

export default function App() {
  const [active, setActive] = useState(MODS[0].key);
  const ActiveComp = useMemo(() => MODS.find(m => m.key === active).comp, [active]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-black/50 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-600 grid place-items-center font-bold">MD</div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Simulación de Eventos Discretos</h1>
              <p className="text-xs text-zinc-400 -mt-1">Modelado, Dinámica de Sistemas y Simulación</p>
            </div>
          </div>
          <a className="h-8 w-8 rounded-xl bg-emerald-600 grid place-items-center font-bold" href="#" onClick={(e)=>{e.preventDefault(); window.scrollTo({top:0,behavior:"smooth"});}}> ▲ </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[220px_1fr] gap-6">
        <nav className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2">
          {MODS.map(m=>(
            <button key={m.key} onClick={()=>setActive(m.key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm mb-1 transition ${active===m.key ? "bg-emerald-600 text-white":"hover:bg-zinc-800"}`}>
              <span>{m.emoji}</span><span>{m.label}</span>
            </button>
          ))}
        </nav>
        <section>
          <ActiveComp />
          <div className="text-xs text-zinc-500 mt-8">Semilla: si la dejas vacía, se usa una aleatoria diferente en cada simulación.</div>
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-zinc-500 border-t border-zinc-800">
        © {new Date().getFullYear()} Modelado, Dinámica de Sistemas y Simulación - Luciana Velasco.
      </footer>
    </div>
  );
}
