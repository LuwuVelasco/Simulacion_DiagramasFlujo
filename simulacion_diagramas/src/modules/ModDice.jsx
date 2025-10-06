import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";
import { rngForReplica } from "../utils/rng";

export default function ModDice() {
  const [nsim, setNsim] = useState(5);
  const [njuegos, setNjuegos] = useState(10);
  const [costo, setCosto] = useState(2);
  const [pagoJugador, setPagoJugador] = useState(5);
  const [seed, setSeed] = useState("");
  const [rows, setRows] = useState([]);
  const [avg, setAvg] = useState({ g: 0, n: 0, p: 0 });

  const simulate = () => {
    const base = seed || Date.now();
    const rngRep = rngForReplica(base);
    const out = [];
    let sumG = 0, sumN = 0, sumP = 0;

    for (let s = 1; s <= nsim; s++) {
      const rng = rngRep(s);
      let NJUEC = 0, GNETA = 0;
      for (let j = 0; j < njuegos; j++) {
        const d1 = 1 + Math.floor(rng() * 6);
        const d2 = 1 + Math.floor(rng() * 6);
        if (d1 + d2 === 7) GNETA += (costo - pagoJugador);
        else { GNETA += costo; NJUEC++; }
      }
      const PJUEC = (NJUEC / njuegos) * 100;
      out.push([s, GNETA.toFixed(2), NJUEC, PJUEC.toFixed(2) + " %"]);
      sumG += GNETA; sumN += NJUEC; sumP += PJUEC;
    }

    setRows(out);
    setAvg({ g: sumG / nsim, n: sumN / nsim, p: sumP / nsim });
  };

  return (
    <div>
      <Section title="Parámetros">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Nº de Simulaciones"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={nsim} onChange={e => setNsim(+e.target.value)} /></Field>
            <Field label="Nº de Juegos [por sim]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={njuegos} onChange={e => setNjuegos(+e.target.value)} /></Field>
            <Field label="Costo del Juego (Bs)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={costo} onChange={e => setCosto(+e.target.value)} /></Field>
            <Field label="Pago si gana jugador (Bs)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={pagoJugador} onChange={e => setPagoJugador(+e.target.value)} /></Field>
          </div>
          <div>
            <Field label="Semilla (opcional)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" value={seed} onChange={e => setSeed(e.target.value)} placeholder="vacío = aleatoria" /></Field>
          </div>
          <div className="flex gap-2 mt-2"><Button onClick={simulate}>SIMULAR</Button><Button variant="ghost" onClick={() => { setRows([]); setAvg({ g: 0, n: 0, p: 0 }); }}>LIMPIAR</Button></div>
        </div>
      </Section>

      <Section title="Resultados por simulación">
        <Table cols={["NSIM", "GNETA [Bs]", "NJUEC (casa)", "P.JUEC [%]"]} rows={rows} />
      </Section>

      <Section title="Promedio">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <Card label="GNETA (prom)" value={`${avg.g.toFixed(2)} Bs`} />
          <Card label="NJUEC (prom)" value={avg.n.toFixed(2)} />
          <Card label="P.JUEC (prom)" value={`${avg.p.toFixed(2)} %`} />
        </div>
      </Section>
    </div>
  );
}
