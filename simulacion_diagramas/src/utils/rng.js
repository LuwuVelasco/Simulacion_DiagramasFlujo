// RNG con semilla opcional (mulberry32) y muestreos comunes
export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed) {
  if (seed === undefined || seed === null || seed === "") return Math.random;
  const s = typeof seed === "number"
    ? seed
    : Array.from(String(seed)).reduce((a, c) => a + c.charCodeAt(0), 0);
  return mulberry32(s >>> 0);
}

// Semillas independientes por réplica: rngForReplica(base)(k) -> rng_k
function seedForReplica(base, k) {
  const b = Number(base) || 0;
  return (b + k * 1000003) >>> 0; // 1000003 es primo grande
}
export function rngForReplica(base) {
  return (k) => makeRng(seedForReplica(base, k));
}

export function sampleCategorical(values, probs, rng) {
  const u = rng();
  let cum = 0;
  for (let i = 0; i < values.length; i++) {
    cum += probs[i];
    if (u <= cum) return values[i];
  }
  return values[values.length - 1];
}

export function samplePoissonKnuth(lambda, rng) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  while (true) {
    k += 1;
    p *= rng();
    if (p <= L) return k - 1;
  }
}

export function sampleExponential(mean, rng) {
  const u = rng();
  return -mean * Math.log(1 - u);
}
