import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";
import { rngForReplica, samplePoissonKnuth } from "../utils/rng";

export default function ModHen() {
  const [nsim, setNsim] = useState(5);
  const [dias, setDias] = useState(30);
  const [pvh, setPvh] = useState(1.5);
  const [pvp, setPvp] = useState(5);
  const [lambda, setLambda] = useState(1);
  const [pRoto, setPRoto] = useState(0.2);
  const [pEclo, setPEclo] = useState(0.3);
  const [pSobre, setPSobre] = useState(0.8);
  const [seed, setSeed] = useState("");
  const [rows, setRows] = useState([]);
  const [avg, setAvg] = useState({ ib: 0, ibpd: 0, thr: 0, tpm: 0, tps: 0, th: 0 });

  const simulate = () => {
    const base = seed || Date.now();
    const rngRep = rngForReplica(base);
    const out = [];
    let sIB = 0, sIBPD = 0, sTHR = 0, sTPM = 0, sTPS = 0, sTH = 0;

    for (let k = 1; k <= nsim; k++) {
      const rng = rngRep(k);
      let THR = 0, TPS = 0, TH = 0, TPM = 0;

      for (let d = 0; d < dias; d++) {
        const HPG = samplePoissonKnuth(lambda, rng);
        for (let i = 0; i < HPG; i++) {
          if (rng() < pRoto) { THR++; continue; }
          if (rng() < pEclo) { // pollo
            if (rng() < pSobre) TPS++; else TPM++;
          } else TH++;
        }
      }

      const IB = TH * pvh + TPS * pvp;
      const IBPD = IB / dias;
      out.push([k, IB.toFixed(2), IBPD.toFixed(2), THR, TPM, TPS, TH]);
      sIB += IB; sIBPD += IBPD; sTHR += THR; sTPM += TPM; sTPS += TPS; sTH += TH;
    }

    setRows(out);
    setAvg({ ib: sIB / nsim, ibpd: sIBPD / nsim, thr: sTHR / nsim, tpm: sTPM / nsim, tps: sTPS / nsim, th: sTH / nsim });
  };

  return (
    <div>
      <Section title="Parámetros">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Field label="Nº simulaciones"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={nsim} onChange={e => setNsim(+e.target.value)} /></Field>
            <Field label="Nº de días (NMD)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" value={dias} onChange={e => setDias(+e.target.value)} /></Field>
            <Field label="Precio huevo [Bs]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" step="0.1" value={pvh} onChange={e => setPvh(+e.target.value)} /></Field>
            <Field label="Precio pollo [Bs]"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" step="0.1" value={pvp} onChange={e => setPvp(+e.target.value)} /></Field>
          </div>
          <div>
            <Field label="Media Huevo/Día (λ)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" step="0.1" value={lambda} onChange={e => setLambda(+e.target.value)} /></Field>
            <Field label="Prob. roto"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" step="0.01" value={pRoto} onChange={e => setPRoto(+e.target.value)} /></Field>
            <Field label="Prob. eclosión"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" step="0.01" value={pEclo} onChange={e => setPEclo(+e.target.value)} /></Field>
            <Field label="Prob. sobrevive (pollo)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" type="number" step="0.01" value={pSobre} onChange={e => setPSobre(+e.target.value)} /></Field>
            <Field label="Semilla (opcional)"><input className="w-full bg-zinc-800 rounded-lg px-3 py-2" value={seed} onChange={e => setSeed(e.target.value)} placeholder="vacío = aleatoria" /></Field>
          </div>
          <div className="flex gap-2 mt-2"><Button onClick={simulate}>SIMULAR</Button><Button variant="ghost" onClick={() => { setRows([]); setAvg({ ib: 0, ibpd: 0, thr: 0, tpm: 0, tps: 0, th: 0 }); }}>LIMPIAR</Button></div>
        </div>
      </Section>

      <Section title="Resultados por simulación">
        <Table cols={["NSIM", "IB [Bs]", "IBPD [Bs/día]", "NHR (rotos)", "NPM (muertos)", "NPS (sobrev)", "NH (quedan)"]} rows={rows} />
      </Section>

      <Section title="Promedio">
        <div className="grid md:grid-cols-6 gap-4 text-sm">
          <Card label="IB (prom)" value={`${avg.ib.toFixed(2)} Bs`} />
          <Card label="IBPD (prom)" value={`${avg.ibpd.toFixed(2)} Bs/día`} />
          <Card label="NHR (prom)" value={avg.thr.toFixed(2)} />
          <Card label="NPM (prom)" value={avg.tpm.toFixed(2)} />
          <Card label="NPS (prom)" value={avg.tps.toFixed(2)} />
          <Card label="NH (prom)" value={avg.th.toFixed(2)} />
        </div>
      </Section>
    </div>
  );
}
