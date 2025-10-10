import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";
import * as V from "../utils/validators";

const DEFAULTS = {
  nsim: 5,
  T: 10,
  K0: 10000,
  i: 0.035,
};

export default function ModInterestFixed(){
  const [nsim,setNsim]=useState(DEFAULTS.nsim);
  const [T,setT]=useState(DEFAULTS.T);
  const [K0,setK0]=useState(DEFAULTS.K0);
  const [i,setI]=useState(DEFAULTS.i);

  const [rowsTrace,setRowsTrace]=useState([]); // traza de 1 corrida
  const [rowsSims,setRowsSims]=useState([]);   // resumen por simulación
  const [avg,setAvg]=useState({KT:0});
  const [err,setErr]=useState({});

  const runOnce = () => {
    // Interés compuesto: I_t = K_t * i
    let K=+K0, out=[];
    for(let t=1;t<=T;t++){
      const Kinicio=K;
      const I = K*(+i);
      K = K + I;
      out.push([t, Kinicio.toFixed(2), (+i).toString(), I.toFixed(2), K.toFixed(2)]);
    }
    return {trace: out, KT: K};
  };

  const simulate=()=>{
    // VALIDACIONES
    const { ok, errors } = V.validate({
      nsim: { value: nsim, rules: ["required","number","integer","gt0"] },
      T:    { value: T,    rules: ["required","number","integer","gt0"] },
      K0:   { value: K0,   rules: ["required","number","gt0"] },
      i:    { value: i,    rules: ["required","number","gt0"] },
    });
    setErr(errors);
    if (!ok) return;

    // determinístico: todas las réplicas dan el mismo K(T)
    const one = runOnce();
    setRowsTrace(one.trace);

    const out=[]; for(let s=1;s<=nsim;s++){ out.push([s, T, K0, i, one.KT.toFixed(2)]); }
    setRowsSims(out);
    setAvg({KT: one.KT});
  };

  const handleLimpiar = () => {
    // Todo a 0 / vacío
    setNsim(0);
    setT(0);
    setK0(0);
    setI(0);
    setRowsTrace([]); 
    setRowsSims([]); 
    setAvg({KT:0});
    setErr({});
  };

  const handleRestablecer = () => {
    setNsim(DEFAULTS.nsim);
    setT(DEFAULTS.T);
    setK0(DEFAULTS.K0);
    setI(DEFAULTS.i);
    setRowsTrace([]); 
    setRowsSims([]); 
    setAvg({KT:0});
    setErr({});
  };

  return (
    <div>
      <Section title="Parámetros">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Nº de simulaciones" error={err.nsim}>
              <input
                min={0}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={nsim}
                onChange={e=>setNsim(+e.target.value)}
              />
            </Field>
            <Field label="Horizonte (T años)" error={err.T}>
              <input
                min={0}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={T}
                onChange={e=>setT(+e.target.value)}
              />
            </Field>
          </div>
          <div>
            <Field label="Capital inicial (K0)" error={err.K0}>
              <input
                min={0}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={K0}
                onChange={e=>setK0(+e.target.value)}
              />
            </Field>
            <Field label="Tasa i (decimal)" error={err.i}>
              <input
                min={0}
                step="0.0001"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={i}
                onChange={e=>setI(+e.target.value)}
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

      <Section title="Traza por período (una corrida)">
        <Table cols={["t","K_inicio","i","I","K_fin"]} rows={rowsTrace}/>
      </Section>

      <Section title="Resultados por simulación">
        <Table cols={["NSIM","T","K0","i","K(T)"]} rows={rowsSims}/>
      </Section>

      <Section title="Promedio (determinístico)">
        <div className="grid md:grid-cols-1 gap-4 text-sm">
          <Card label="K(T) (prom)" value={`${avg.KT.toFixed(2)} $us`} />
        </div>
      </Section>
    </div>
  );
}
