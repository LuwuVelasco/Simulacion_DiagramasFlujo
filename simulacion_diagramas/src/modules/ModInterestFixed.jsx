import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";

export default function ModInterestFixed(){
  const [nsim,setNsim]=useState(5);
  const [T,setT]=useState(10);
  const [K0,setK0]=useState(10000);
  const [i,setI]=useState(0.035);

  const [rowsTrace,setRowsTrace]=useState([]); // traza de 1 corrida
  const [rowsSims,setRowsSims]=useState([]);   // resumen por simulación
  const [avg,setAvg]=useState({KT:0});

  const runOnce = () => {
    // interés compuesto: I_t = K_t * i
    let K=+K0, out=[];
    for(let t=1;t<=T;t++){
      const Kinicio=K;
      const I = K*(+i);
      K = K + I;
      out.push([t, Kinicio.toFixed(2), i, I.toFixed(2), K.toFixed(2)]);
    }
    return {trace: out, KT: K};
  };

  const simulate=()=>{
    // determinístico: todas las réplicas dan el mismo K(T)
    const one = runOnce();
    setRowsTrace(one.trace);

    const out=[]; for(let s=1;s<=nsim;s++){ out.push([s, T, K0, i, one.KT.toFixed(2)]); }
    setRowsSims(out);
    setAvg({KT: one.KT});
  };

  return (
    <div>
      <Section title="Parámetros">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Nº de simulaciones"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={nsim} onChange={e=>setNsim(+e.target.value)} /></Field>
            <Field label="Horizonte (T años)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={T} onChange={e=>setT(+e.target.value)} /></Field>
          </div>
          <div>
            <Field label="Capital inicial (K0)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={K0} onChange={e=>setK0(+e.target.value)} /></Field>
            <Field label="Tasa i (decimal)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" step="0.0001" value={i} onChange={e=>setI(+e.target.value)} /></Field>
          </div>
          <div className="flex gap-2 mt-2"><Button onClick={simulate}>SIMULAR</Button><Button variant="ghost" onClick={()=>{setRowsTrace([]); setRowsSims([]); setAvg({KT:0});}}>LIMPIAR</Button></div>
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
