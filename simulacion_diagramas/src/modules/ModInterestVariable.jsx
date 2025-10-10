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
  K0: 9500,
};

export default function ModInterestVariable(){
  const [nsim,setNsim]=useState(DEFAULTS.nsim);
  const [T,setT]=useState(DEFAULTS.T);
  const [K0,setK0]=useState(DEFAULTS.K0);

  const [rowsTrace,setRowsTrace]=useState([]);
  const [rowsSims,setRowsSims]=useState([]);
  const [avg,setAvg]=useState({KT:0, i0:0});
  const [err,setErr]=useState({});

  const tramo=(K0)=> (K0<=10000?0.035 : K0<=100000?0.037 : 0.04);

  const runOnce = () => {
    const i0 = tramo(+K0); // la tasa se fija UNA VEZ con K0
    let K=+K0, out=[];
    for(let t=1;t<=T;t++){
      const Kinicio=K; const I=Kinicio*i0; K=Kinicio+I;
      out.push([t, Kinicio.toFixed(2), i0.toString(), I.toFixed(2), K.toFixed(2)]);
    }
    return {trace: out, KT: K, i0};
  };

  const simulate=()=>{
    // VALIDACIONES
    const { ok, errors } = V.validate({
      nsim: { value: nsim, rules: ["required","number","integer","gt0"] },
      T:    { value: T,    rules: ["required","number","integer","gt0"] },
      K0:   { value: K0,   rules: ["required","number","gt0"] },
    });
    setErr(errors);
    if (!ok) return;

    const one = runOnce();
    setRowsTrace(one.trace);

    const out=[]; for(let s=1;s<=nsim;s++){ out.push([s, T, K0, one.i0, one.KT.toFixed(2)]); }
    setRowsSims(out);
    setAvg({KT: one.KT, i0: one.i0});
  };

  const handleLimpiar = ()=>{
    // Todo a 0 / vacío
    setNsim(0);
    setT(0);
    setK0(0);
    setRowsTrace([]); 
    setRowsSims([]); 
    setAvg({KT:0,i0:0});
    setErr({});
  };

  const handleRestablecer = ()=>{
    setNsim(DEFAULTS.nsim);
    setT(DEFAULTS.T);
    setK0(DEFAULTS.K0);
    setRowsTrace([]); 
    setRowsSims([]); 
    setAvg({KT:0,i0:0});
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
          </div>
          <div className="flex gap-2 mt-2">
            <Button onClick={simulate}>SIMULAR</Button>
            <Button variant="ghost" onClick={handleLimpiar}>LIMPIAR</Button>
            <Button variant="ghost" onClick={handleRestablecer}>VALORES EJERCICIO</Button>
          </div>
        </div>
      </Section>

      <Section title="Traza por período (una corrida)">
        <Table cols={["t","K_inicio","i0","I","K_fin"]} rows={rowsTrace}/>
      </Section>

      <Section title="Resultados por simulación">
        <Table cols={["NSIM","T","K0","i0","K(T)"]} rows={rowsSims}/>
      </Section>

      <Section title="Promedio (determinístico)">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <Card label="i0 seleccionado" value={`${(avg.i0*100).toFixed(2)} %`} />
          <Card label="K(T) (prom)" value={`${avg.KT.toFixed(2)} $us`} />
        </div>
      </Section>
    </div>
  );
}
