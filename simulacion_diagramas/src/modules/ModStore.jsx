import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";
import { rngForReplica, sampleCategorical } from "../utils/rng";

export default function ModStore() {
  const [nsim, setNsim] = useState(5);
  const [horas, setHoras] = useState(8);
  const [precio, setPrecio] = useState(75);
  const [costo, setCosto] = useState(50);
  const [cf, setCF] = useState(300);
  const [seed, setSeed] = useState("");
  const [rows, setRows] = useState([]);
  const [avg, setAvg] = useState({ gn: 0, v: 0 });

  const simulate = () => {
    const base = seed || Date.now();
    const rngRep = rngForReplica(base);
    const out = []; let sGN = 0, sV = 0;

    for (let k = 1; k <= nsim; k++) {
      const rng = rngRep(k);
      let V = 0;
      for (let h = 0; h < horas; h++) {
        const Ah = Math.floor(rng() * 5); // 0..4
        for (let i = 0; i < Ah; i++) {
          const X = sampleCategorical([0, 1, 2, 3], [0.2, 0.3, 0.4, 0.1], rng);
          V += X;
        }
      }
      const GN = (precio - costo) * V - cf;
      out.push([k, V, GN.toFixed(2)]);
      sGN += GN; sV += V;
    }
    setRows(out); setAvg({ gn: sGN / nsim, v: sV / nsim });
  };

  return (
    <div>
      <Section title="Parámetros">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Nº simulaciones"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={nsim} onChange={e => setNsim(+e.target.value)} /></Field>
            <Field label="Horas del día (H)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={horas} onChange={e => setHoras(+e.target.value)} /></Field>
            <Field label="Precio unitario [Bs]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={precio} onChange={e => setPrecio(+e.target.value)} /></Field>
          </div>
          <div>
            <Field label="Costo unitario [Bs]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={costo} onChange={e => setCosto(+e.target.value)} /></Field>
            <Field label="Costo fijo diario [Bs]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={cf} onChange={e => setCF(+e.target.value)} /></Field>
            <Field label="Semilla (opcional)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" value={seed} onChange={e => setSeed(e.target.value)} placeholder="vacío = aleatoria" /></Field>
          </div>
          <div className="flex gap-2 mt-2"><Button onClick={simulate}>SIMULAR</Button><Button variant="ghost" onClick={() => { setRows([]); setAvg({ gn: 0, v: 0 }); }}>LIMPIAR</Button></div>
        </div>
      </Section>

      <Section title="Resultados por simulación">
        <Table cols={["NSIM", "Artículos vendidos (V)", "Ganancia neta [Bs]"]} rows={rows} />
      </Section>

      <Section title="Promedio">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <Card label="Artículos vendidos (prom)" value={avg.v.toFixed(2)} />
          <Card label="Ganancia neta (prom)" value={`${avg.gn.toFixed(2)} Bs`} />
        </div>
      </Section>
    </div>
  );
}
