import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";

export default function ModInterestVariable(){
  const [nsim,setNsim]=useState(5);
  const [T,setT]=useState(10);
  const [K0,setK0]=useState(9500);

  const [rowsTrace,setRowsTrace]=useState([]);
  const [rowsSims,setRowsSims]=useState([]);
  const [avg,setAvg]=useState({KT:0, i0:0});

  const tramo=(K0)=> (K0<=10000?0.035 : K0<=100000?0.037 : 0.04);

  const runOnce = () => {
    const i0 = tramo(+K0); // la tasa se fija UNA VEZ con K0
    let K=+K0, out=[];
    for(let t=1;t<=T;t++){
      const Kinicio=K; const I=Kinicio*i0; K=Kinicio+I;
      out.push([t, Kinicio.toFixed(2), i0, I.toFixed(2), K.toFixed(2)]);
    }
    return {trace: out, KT: K, i0};
  };

  const simulate=()=>{
    const one = runOnce();
    setRowsTrace(one.trace);

    const out=[]; for(let s=1;s<=nsim;s++){ out.push([s, T, K0, one.i0, one.KT.toFixed(2)]); }
    setRowsSims(out);
    setAvg({KT: one.KT, i0: one.i0});
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
          </div>
          <div className="flex gap-2 mt-2"><Button onClick={simulate}>SIMULAR</Button><Button variant="ghost" onClick={()=>{setRowsTrace([]); setRowsSims([]); setAvg({KT:0,i0:0});}}>LIMPIAR</Button></div>
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
