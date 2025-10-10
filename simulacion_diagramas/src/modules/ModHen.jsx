import { useState } from "react";
import Section from "../components/Section";
import Field from "../components/Field";
import Button from "../components/Button";
import Table from "../components/Table";
import Card from "../components/Card";
import { rngForReplica, samplePoissonKnuth } from "../utils/rng";
import * as V from "../utils/validators";

const DEFAULTS = {
  nsim: 5,
  dias: 30,
  pvh: 1.5,
  pvp: 5,
  lambda: 1,
  pRoto: 0.2,
  pEclo: 0.3,
  pSobre: 0.8,
  seed: "",
};

export default function ModHen() {
  const [nsim, setNsim] = useState(DEFAULTS.nsim);
  const [dias, setDias] = useState(DEFAULTS.dias);
  const [pvh, setPvh] = useState(DEFAULTS.pvh);
  const [pvp, setPvp] = useState(DEFAULTS.pvp);
  const [lambda, setLambda] = useState(DEFAULTS.lambda);
  const [pRoto, setPRoto] = useState(DEFAULTS.pRoto);
  const [pEclo, setPEclo] = useState(DEFAULTS.pEclo);
  const [pSobre, setPSobre] = useState(DEFAULTS.pSobre);
  const [seed, setSeed] = useState(DEFAULTS.seed);

  const [rows, setRows] = useState([]);
  const [avg, setAvg] = useState({ ib: 0, ibpd: 0, thr: 0, tpm: 0, tps: 0, th: 0 });
  const [err, setErr] = useState({});

  const simulate = () => {
    // 1) Validaciones de reglas generales
    const { ok, errors } = V.validate({
      nsim:   { value: nsim,   rules: ["required", "number", "integer", "gt0"] },
      dias:   { value: dias,   rules: ["required", "number", "integer", "gt0"] },
      pvh:    { value: pvh,    rules: ["required", "number", "ge0"] },
      pvp:    { value: pvp,    rules: ["required", "number", "ge0"] },
      lambda: { value: lambda, rules: ["required", "number", "gt0"] },
      pRoto:  { value: pRoto,  rules: ["required", "number", "prob01"] },
      pEclo:  { value: pEclo,  rules: ["required", "number", "prob01"] },
      pSobre: { value: pSobre, rules: ["required", "number", "prob01"] },
    });

    const nextErr = { ...errors };

    // 2) Semilla: no negativa si es numérica
    if (seed !== "") {
      const maybe = Number(seed);
      if (!Number.isNaN(maybe) && maybe < 0) {
        nextErr.seed = "La semilla no puede ser negativa";
      }
    }

    setErr(nextErr);
    if (!ok || nextErr.seed) return;

    // 3) Simulación
    const base = seed || Date.now();
    const rngRep = rngForReplica(base);
    const out = [];
    let sIB = 0, sIBPD = 0, sTHR = 0, sTPM = 0, sTPS = 0, sTH = 0;

    for (let k = 1; k <= nsim; k++) {
      const rng = rngRep(k);
      let THR = 0, TPS = 0, TH = 0, TPM = 0;

      for (let d = 0; d < dias; d++) {
        const HPG = samplePoissonKnuth(+lambda, rng);
        for (let i = 0; i < HPG; i++) {
          if (rng() < +pRoto) { THR++; continue; }
          if (rng() < +pEclo) {
            if (rng() < +pSobre) TPS++; else TPM++;
          } else {
            TH++;
          }
        }
      }

      const IB = TH * +pvh + TPS * +pvp;
      const IBPD = IB / +dias;
      out.push([k, IB.toFixed(2), IBPD.toFixed(2), THR, TPM, TPS, TH]);
      sIB += IB; sIBPD += IBPD; sTHR += THR; sTPM += TPM; sTPS += TPS; sTH += TH;
    }

    setRows(out);
    setAvg({
      ib: sIB / nsim,
      ibpd: sIBPD / nsim,
      thr: sTHR / nsim,
      tpm: sTPM / nsim,
      tps: sTPS / nsim,
      th: sTH / nsim
    });
  };

  const handleLimpiar = () => {
    setNsim(0);
    setDias(0);
    setPvh(0);
    setPvp(0);
    setLambda(0);
    setPRoto(0);
    setPEclo(0);
    setPSobre(0);
    setSeed("");

    setRows([]);
    setAvg({ ib: 0, ibpd: 0, thr: 0, tpm: 0, tps: 0, th: 0 });
    setErr({});
  };

  const handleRestablecer = () => {
    setNsim(DEFAULTS.nsim);
    setDias(DEFAULTS.dias);
    setPvh(DEFAULTS.pvh);
    setPvp(DEFAULTS.pvp);
    setLambda(DEFAULTS.lambda);
    setPRoto(DEFAULTS.pRoto);
    setPEclo(DEFAULTS.pEclo);
    setPSobre(DEFAULTS.pSobre);
    setSeed(DEFAULTS.seed);

    setRows([]);
    setAvg({ ib: 0, ibpd: 0, thr: 0, tpm: 0, tps: 0, th: 0 });
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
            <Field label="Nº de días (NMD)" error={err.dias}>
              <input
                min={0}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={dias}
                onChange={e => setDias(+e.target.value)}
              />
            </Field>
            <Field label="Precio huevo [Bs]" error={err.pvh}>
              <input
                min={0}
                step="0.01"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={pvh}
                onChange={e => setPvh(+e.target.value)}
              />
            </Field>
            <Field label="Precio pollo [Bs]" error={err.pvp}>
              <input
                min={0}
                step="0.01"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={pvp}
                onChange={e => setPvp(+e.target.value)}
              />
            </Field>
          </div>
          <div>
            <Field label="Media Huevo/Día (λ)" error={err.lambda}>
              <input
                min={0}
                step="0.1"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={lambda}
                onChange={e => setLambda(+e.target.value)}
              />
            </Field>
            <Field label="Prob. roto" error={err.pRoto}>
              <input
                min={0} max={1} step="0.01"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={pRoto}
                onChange={e => setPRoto(+e.target.value)}
              />
            </Field>
            <Field label="Prob. eclosión" error={err.pEclo}>
              <input
                min={0} max={1} step="0.01"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={pEclo}
                onChange={e => setPEclo(+e.target.value)}
              />
            </Field>
            <Field label="Prob. sobrevive (pollo)" error={err.pSobre}>
              <input
                min={0} max={1} step="0.01"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2"
                type="number"
                value={pSobre}
                onChange={e => setPSobre(+e.target.value)}
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
        <Table
          cols={["NSIM", "IB [Bs]", "IBPD [Bs/día]", "NHR (rotos)", "NPM (muertos)", "NPS (sobrev)", "NH (quedan)"]}
          rows={rows}
        />
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
