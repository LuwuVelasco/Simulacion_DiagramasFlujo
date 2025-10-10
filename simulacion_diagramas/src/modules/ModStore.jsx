import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";
import { rngForReplica, sampleCategorical } from "../utils/rng";
import * as V from "../utils/validators";

const DEFAULTS = {
  nsim: 5,
  horas: 8,
  precio: 75,
  costo: 50,
  cf: 300,
  seed: "",
};

export default function ModStore() {
  const [nsim, setNsim] = useState(DEFAULTS.nsim);
  const [horas, setHoras] = useState(DEFAULTS.horas);
  const [precio, setPrecio] = useState(DEFAULTS.precio);
  const [costo, setCosto] = useState(DEFAULTS.costo);
  const [cf, setCF] = useState(DEFAULTS.cf);
  const [seed, setSeed] = useState(DEFAULTS.seed);

  const [rows, setRows] = useState([]);
  const [avg, setAvg] = useState({ gn: 0, v: 0 });
  const [err, setErr] = useState({});

  const simulate = () => {
    // VALIDACIONES
    const { ok, errors } = V.validate({
      nsim:  { value: nsim,  rules: ["required", "number", "integer", "gt0"] },
      horas: { value: horas, rules: ["required", "number", "integer", "gt0"] },
      precio:{ value: precio,rules: ["required", "number", "gt0"] },
      costo: { value: costo, rules: ["required", "number", "gt0"] },
      cf:    { value: cf,    rules: ["required", "number", "gt0"] },
    });
    const nextErr = { ...errors };

    // Semilla: si es numérica, debe ser >= 0
    if (seed !== "") {
      const maybe = Number(seed);
      if (!Number.isNaN(maybe) && maybe < 0) {
        nextErr.seed = "La semilla no puede ser negativa";
      }
    }

    setErr(nextErr);
    if (!ok || nextErr.seed) return;

    // SIMULACIÓN
    const base = seed || Date.now();
    const rngRep = rngForReplica(base);
    const out = []; let sGN = 0, sV = 0;

    for (let k = 1; k <= nsim; k++) {
      const rng = rngRep(k);
      let V = 0;
      for (let h = 0; h < horas; h++) {
        const Ah = Math.floor(rng() * 5); // 0..4 clientes en la hora
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

  const handleLimpiar = () => {
    // Todo a 0 / vacío
    setNsim(0);
    setHoras(0);
    setPrecio(0);
    setCosto(0);
    setCF(0);
    setSeed("");
    setRows([]);
    setAvg({ gn: 0, v: 0 });
    setErr({});
  };

  const handleRestablecer = () => {
    // Volver a valores por defecto del ejercicio
    setNsim(DEFAULTS.nsim);
    setHoras(DEFAULTS.horas);
    setPrecio(DEFAULTS.precio);
    setCosto(DEFAULTS.costo);
    setCF(DEFAULTS.cf);
    setSeed(DEFAULTS.seed);
    setRows([]);
    setAvg({ gn: 0, v: 0 });
    setErr({});
  };

  return (
    <div>
      <Section title="Parámetros">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Nº simulaciones" error={err.nsim}>
              <input
                min={0}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={nsim}
                onChange={e => setNsim(+e.target.value)}
              />
            </Field>
            <Field label="Horas del día (H)" error={err.horas}>
              <input
                min={0}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={horas}
                onChange={e => setHoras(+e.target.value)}
              />
            </Field>
            <Field label="Precio unitario [Bs]" error={err.precio}>
              <input
                min={0} step="0.01"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={precio}
                onChange={e => setPrecio(+e.target.value)}
              />
            </Field>
          </div>
          <div>
            <Field label="Costo unitario [Bs]" error={err.costo}>
              <input
                min={0} step="0.01"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={costo}
                onChange={e => setCosto(+e.target.value)}
              />
            </Field>
            <Field label="Costo fijo diario [Bs]" error={err.cf}>
              <input
                min={0} step="0.01"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={cf}
                onChange={e => setCF(+e.target.value)}
              />
            </Field>
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
