// Reglas atómicas
export const isNumber = (v) => v !== "" && !Number.isNaN(+v);
export const isInt = (v) => Number.isInteger(+v);
export const ge0 = (v) => +v >= 0;
export const gt0 = (v) => +v > 0;
export const prob01 = (v) => +v >= 0 && +v <= 1;

// Mensajes
const M = {
  required: "Requerido",
  number: "Debe ser numérico",
  integer: "Debe ser entero",
  ge0: "Debe ser ≥ 0",
  gt0: "Debe ser > 0",
  prob01: "Debe estar en [0, 1]",
};

// Valida un objeto {campo: {value, rules: [...]}}
export function validate(spec) {
  const errors = {};
  let ok = true;

  for (const [key, cfg] of Object.entries(spec)) {
    const v = cfg.value;
    const rules = cfg.rules || [];
    for (const r of rules) {
      if (r === "required" && (v === "" || v === null || v === undefined)) {
        errors[key] = M.required; ok = false; break;
      }
      if (r === "number" && !isNumber(v)) { errors[key] = M.number; ok = false; break; }
      if (r === "integer" && !isInt(v)) { errors[key] = M.integer; ok = false; break; }
      if (r === "ge0" && !ge0(v)) { errors[key] = M.ge0; ok = false; break; }
      if (r === "gt0" && !gt0(v)) { errors[key] = M.gt0; ok = false; break; }
      if (r === "prob01" && !prob01(v)) { errors[key] = M.prob01; ok = false; break; }
    }
  }
  return { ok, errors };
}

// Helpers para limpiar
export function zeros(objKeys) {
  const out = {};
  objKeys.forEach(k => out[k] = 0);
  return out;
}