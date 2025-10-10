import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";
import { rngForReplica, sampleExponential } from "../utils/rng";
import * as V from "../utils/validators";

const DEFAULTS = {
  nsim: 5,
  dias: 27,
  cap: 700,
  cord: 100,
  cui: 0.1,
  cua: 3.5,
  puv: 5,
  mean: 100,
  seed: "",
};

export default function ModInventory(){
  const [nsim,setNsim]=useState(DEFAULTS.nsim);
  const [dias,setDias]=useState(DEFAULTS.dias);
  const [cap,setCap]=useState(DEFAULTS.cap);
  const [cord,setCord]=useState(DEFAULTS.cord);
  const [cui,setCui]=useState(DEFAULTS.cui);
  const [cua,setCua]=useState(DEFAULTS.cua);
  const [puv,setPuv]=useState(DEFAULTS.puv);
  const [mean,setMean]=useState(DEFAULTS.mean);
  const [seed,setSeed]=useState(DEFAULTS.seed);

  const [rows,setRows]=useState([]);
  const [avg,setAvg]=useState({g:0, dit:0, ns:0});
  const [err, setErr] = useState({});

  const simulateOne=(rng)=>{
    let IAZU=0; let CORDT=0, CTINV=0, CTADQ=0, IBRU=0, DIT=0;
    const REV=new Set([1,8,15,22]); const pipe=[];
    for(let d=1; d<=dias; d++){
      // llegada de pedidos en tránsito
      for(const p of pipe) p.tent -= 1;
      const llegados = pipe.filter(p=>p.tent<=0);
      for(const p of llegados){
        const espacio = cap - IAZU;
        const ing = Math.min(p.q, Math.max(0, espacio));
        IAZU += ing; CTADQ += ing*cua;
      }
      // purge de los que ya llegaron
      for(let i=pipe.length-1;i>=0;i--) if(pipe[i].tent<=0) pipe.splice(i,1);

      // demanda del día (Exponencial con media 'mean' > 0)
      const DAZU = sampleExponential(mean, rng);
      const ventas = Math.min(IAZU, DAZU);
      const insat = Math.max(0, DAZU - ventas);
      IAZU -= ventas; IBRU += ventas*puv; DIT += insat;

      // costo de mantener inventario al final del día
      CTINV += cui * IAZU;

      // revisión/orden (días 1,8,15,22)
      if (REV.has(d)){
        const PAZU = cap - IAZU;
        if (PAZU>0){
          const tent = 1 + Math.floor(rng()*3); // uniforme {1,2,3}
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
    // VALIDACIONES
    const { ok, errors } = V.validate({
      nsim: { value: nsim, rules: ["required","number","integer","gt0"] },
      dias: { value: dias, rules: ["required","number","integer","gt0"] },
      cap:  { value: cap,  rules: ["required","number","gt0"] },
      cord: { value: cord, rules: ["required","number","gt0"] },
      cui:  { value: cui,  rules: ["required","number","gt0"] },
      cua:  { value: cua,  rules: ["required","number","gt0"] },
      puv:  { value: puv,  rules: ["required","number","gt0"] },
      mean: { value: mean, rules: ["required","number","gt0"] },
    });
    const nextErr = { ...errors };

    // Semilla no negativa (si es numérica)
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
    const out=[]; let sG=0,sD=0,sN=0;
    for(let k=1;k<=nsim;k++){
      const r = simulateOne(rngRep(k));
      out.push([k, r.GNETA.toFixed(2), r.DIT.toFixed(1), (r.nivelServicio*100).toFixed(2)+" %"]);
      sG+=r.GNETA; sD+=r.DIT; sN+=r.nivelServicio;
    }
    setRows(out); setAvg({g:sG/nsim, dit:sD/nsim, ns:sN/nsim});
  };

  const handleLimpiar = ()=>{
    // todo a 0 / vacío
    setNsim(0); setDias(0); setCap(0); setCord(0);
    setCui(0); setCua(0); setPuv(0); setMean(0); setSeed("");
    setRows([]); setAvg({g:0,dit:0,ns:0}); setErr({});
  };

  const handleRestablecer = ()=>{
    setNsim(DEFAULTS.nsim); setDias(DEFAULTS.dias); setCap(DEFAULTS.cap); setCord(DEFAULTS.cord);
    setCui(DEFAULTS.cui); setCua(DEFAULTS.cua); setPuv(DEFAULTS.puv); setMean(DEFAULTS.mean); setSeed(DEFAULTS.seed);
    setRows([]); setAvg({g:0,dit:0,ns:0}); setErr({});
  };

  return (
    <div>
      <Section title="Parámetros">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Nº simulaciones" error={err.nsim}>
              <input min={0} className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number"
                     value={nsim} onChange={e=>setNsim(+e.target.value)} />
            </Field>
            <Field label="Horizonte (días)" error={err.dias}>
              <input min={0} className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number"
                     value={dias} onChange={e=>setDias(+e.target.value)} />
            </Field>
            <Field label="Capacidad [kg]" error={err.cap}>
              <input min={0} className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number"
                     value={cap} onChange={e=>setCap(+e.target.value)} />
            </Field>
            <Field label="Costo por orden [Bs]" error={err.cord}>
              <input min={0} className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number"
                     value={cord} onChange={e=>setCord(+e.target.value)} />
            </Field>
          </div>
          <div>
            <Field label="Costo unitario de inventario [Bs/kg·día]" error={err.cui}>
              <input min={0} step="0.01" className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number"
                     value={cui} onChange={e=>setCui(+e.target.value)} />
            </Field>
            <Field label="Costo unitario de adquisición [Bs/kg]" error={err.cua}>
              <input min={0} step="0.01" className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number"
                     value={cua} onChange={e=>setCua(+e.target.value)} />
            </Field>
            <Field label="Precio de venta [Bs/kg]" error={err.puv}>
              <input min={0} step="0.01" className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number"
                     value={puv} onChange={e=>setPuv(+e.target.value)} />
            </Field>
            <Field label="Demanda media [kg/día]" error={err.mean}>
              <input min={0} className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number"
                     value={mean} onChange={e=>setMean(+e.target.value)} />
            </Field>
            <Field label="Semilla (opcional)" error={err.seed}>
              <input className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                     value={seed} onChange={e=>setSeed(e.target.value)}
                     placeholder="vacío = aleatoria" />
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
