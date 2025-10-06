import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";
import { rngForReplica, sampleExponential } from "../utils/rng";

export default function ModInventory(){
  const [nsim,setNsim]=useState(5);
  const [dias,setDias]=useState(27);
  const [cap,setCap]=useState(700);
  const [cord,setCord]=useState(100);
  const [cui,setCui]=useState(0.1);
  const [cua,setCua]=useState(3.5);
  const [puv,setPuv]=useState(5);
  const [mean,setMean]=useState(100);
  const [seed,setSeed]=useState("");
  const [rows,setRows]=useState([]);
  const [avg,setAvg]=useState({g:0, dit:0, ns:0});

  const simulateOne=(rng)=>{
    let IAZU=0; let CORDT=0, CTINV=0, CTADQ=0, IBRU=0, DIT=0;
    const REV=new Set([1,8,15,22]); const pipe=[];
    for(let d=1; d<=dias; d++){
      // llegadas
      for(const p of pipe) p.tent -= 1;
      const llegados = pipe.filter(p=>p.tent<=0);
      for(const p of llegados){
        const espacio = cap - IAZU;
        const ing = Math.min(p.q, Math.max(0, espacio));
        IAZU += ing; CTADQ += ing*cua;
      }
      for(let i=pipe.length-1;i>=0;i--) if(pipe[i].tent<=0) pipe.splice(i,1);
      // demanda
      const DAZU = sampleExponential(mean, rng);
      const ventas = Math.min(IAZU, DAZU);
      const insat = Math.max(0, DAZU - ventas);
      IAZU -= ventas; IBRU += ventas*puv; DIT += insat;
      // holding
      CTINV += cui * IAZU;
      // revisión
      if (REV.has(d)){
        const PAZU = cap - IAZU;
        if (PAZU>0){
          const tent = 1 + Math.floor(rng()*3);
          pipe.push({q:PAZU, tent});
          CORDT += cord;
        }
      }
    }
    const CTOT = CTINV + CTADQ + CORDT;
    const GNETA = IBRU - CTOT;
    const nivelServicio = (IBRU/puv)/((IBRU/puv)+DIT || 1);
    return {GNETA, DIT, nivelServicio};
  };

  const simulate=()=>{
    const base = seed || Date.now();
    const rngRep = rngForReplica(base);
    const out=[]; let sG=0,sD=0,sN=0;
    for(let k=1;k<=nsim;k++){
      const r = simulateOne(rngRep(k));
      out.push([k, r.GNETA.toFixed(2), r.DIT.toFixed(1), (r.nivelServicio*100).toFixed(2)+" %"]);
      sG+=r.GNETA; sD+=r.DIT; sN+=r.nivelServicio;
    }
    setRows(out); setAvg({g:sG/nsim, dit:sD/nsim, ns:sN/nsim});
  };

  return (
    <div>
      <Section title="Parámetros">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Nº simulaciones"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={nsim} onChange={e=>setNsim(+e.target.value)} /></Field>
            <Field label="Horizonte (días)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={dias} onChange={e=>setDias(+e.target.value)} /></Field>
            <Field label="Capacidad [kg]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={cap} onChange={e=>setCap(+e.target.value)} /></Field>
            <Field label="Costo por orden [Bs]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={cord} onChange={e=>setCord(+e.target.value)} /></Field>
          </div>
          <div>
            <Field label="CUI [Bs/kg·día]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" step="0.01" value={cui} onChange={e=>setCui(+e.target.value)} /></Field>
            <Field label="CUA [Bs/kg]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" step="0.01" value={cua} onChange={e=>setCua(+e.target.value)} /></Field>
            <Field label="Precio de venta [Bs/kg]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" step="0.01" value={puv} onChange={e=>setPuv(+e.target.value)} /></Field>
            <Field label="Demanda media [kg/día]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={mean} onChange={e=>setMean(+e.target.value)} /></Field>
            <Field label="Semilla (opcional)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" value={seed} onChange={e=>setSeed(e.target.value)} placeholder="vacío = aleatoria" /></Field>
          </div>
          <div className="flex gap-2 mt-2"><Button onClick={simulate}>SIMULAR</Button><Button variant="ghost" onClick={()=>{setRows([]); setAvg({g:0,dit:0,ns:0});}}>LIMPIAR</Button></div>
        </div>
      </Section>

      <Section title="Resultados por simulación">
        <Table cols={["NSIM","GNETA [Bs]","DIT [kg]","Nivel servicio [%]"]} rows={rows}/>
      </Section>

      <Section title="Promedio">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <Card label="GNETA (prom)" value={`${avg.g.toFixed(2)} Bs`} />
          <Card label="DIT (prom)" value={`${avg.dit.toFixed(1)} kg`} />
          <Card label="Nivel de servicio (prom)" value={`${(avg.ns*100).toFixed(2)} %`} />
        </div>
      </Section>
    </div>
  );
}
