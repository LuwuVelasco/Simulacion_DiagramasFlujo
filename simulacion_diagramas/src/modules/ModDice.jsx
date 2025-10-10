import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";
import { rngForReplica } from "../utils/rng";
import * as V from "../utils/validators";

const DEFAULTS = {
  nsim: 5,
  njuegos: 10,
  costo: 2,
  pagoJugador: 5,
  seed: "",
};

export default function ModDice() {
  const [nsim, setNsim] = useState(DEFAULTS.nsim);
  const [njuegos, setNjuegos] = useState(DEFAULTS.njuegos);
  const [costo, setCosto] = useState(DEFAULTS.costo);
  const [pagoJugador, setPagoJugador] = useState(DEFAULTS.pagoJugador);
  const [seed, setSeed] = useState(DEFAULTS.seed);

  const [rows, setRows] = useState([]);
  const [avg, setAvg] = useState({ g: 0, n: 0, p: 0 });
  const [err, setErr] = useState({});

  const simulate = () => {
    const { ok, errors } = V.validate({
      nsim:        { value: nsim,        rules: ["required", "number", "integer", "gt0"] },
      njuegos:     { value: njuegos,     rules: ["required", "number", "integer", "gt0"] },
      costo:       { value: costo,       rules: ["required", "number", "ge0"] },
      pagoJugador: { value: pagoJugador, rules: ["required", "number", "ge0"] },
    });

    const nextErr = { ...errors };

    if (seed !== "") {
      const maybe = Number(seed);
      if (!Number.isNaN(maybe) && maybe < 0) {
        nextErr.seed = "La semilla no puede ser negativa";
      }
    }

    setErr(nextErr);
    if (!ok || nextErr.seed) return;

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
        if (d1 + d2 === 7) {
          GNETA += (costo - pagoJugador);
        } else {
          GNETA += costo;
          NJUEC++;
        }
      }
      const PJUEC = (NJUEC / njuegos) * 100;
      out.push([s, GNETA.toFixed(2), NJUEC, PJUEC.toFixed(2) + " %"]);
      sumG += GNETA; sumN += NJUEC; sumP += PJUEC;
    }

    setRows(out);
    setAvg({ g: sumG / nsim, n: sumN / nsim, p: sumP / nsim });
  };

  const handleLimpiar = () => {
    setNsim(0);
    setNjuegos(0);
    setCosto(0);
    setPagoJugador(0);
    setSeed("");
    setRows([]);
    setAvg({ g: 0, n: 0, p: 0 });
    setErr({});
  };

  const handleRestablecer = () => {
    setNsim(DEFAULTS.nsim);
    setNjuegos(DEFAULTS.njuegos);
    setCosto(DEFAULTS.costo);
    setPagoJugador(DEFAULTS.pagoJugador);
    setSeed(DEFAULTS.seed);
    setRows([]);
    setAvg({ g: 0, n: 0, p: 0 });
    setErr({});
  };

  return (
    <div>
      <Section title="Parámetros">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Nº de Simulaciones" error={err.nsim}>
              <input
                min={0}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={nsim}
                onChange={e => setNsim(+e.target.value)}
              />
            </Field>
            <Field label="Nº de Juegos [por sim]" error={err.njuegos}>
              <input
                min={0}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={njuegos}
                onChange={e => setNjuegos(+e.target.value)}
              />
            </Field>
            <Field label="Costo del Juego (Bs)" error={err.costo}>
              <input
                min={0}
                step="0.01"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={costo}
                onChange={e => setCosto(+e.target.value)}
              />
            </Field>
            <Field label="Pago si gana jugador (Bs)" error={err.pagoJugador}>
              <input
                min={0}
                step="0.01"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={pagoJugador}
                onChange={e => setPagoJugador(+e.target.value)}
              />
            </Field>
          </div>
          <div>
            <Field label="Semilla (opcional)" error={err.seed}>
              <input
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                value={seed}
                onChange={e => setSeed(e.target.value)}
                placeholder="vacío = aleatoria"
              />
            </Field>
          </div>
          <div className="flex gap-2 mt-2">
            <Button onClick={simulate}>SIMULAR</Button>
            <Button variant="ghost" onClick={handleLimpiar}>LIMPIAR</Button>
            <Button variant="ghost" onClick={handleRestablecer}>VALORES EJERCICIO</Button>
          </div>
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
