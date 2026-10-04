/**
 * Constantes de nómina Ecuador. El aporte IESS personal (9.45%) y patronal
 * (11.15%) son estables desde hace varios años, pero el Salario Básico
 * Unificado (SBU, usado para el décimo cuarto) cambia cada enero por
 * acuerdo ministerial — confírmalo con tu contador y actualiza
 * NETSEG_SBU en tus variables de entorno cada año.
 */
export const IESS_PERSONAL_PCT = 9.45;
export const IESS_PATRONAL_PCT = 11.15;

export function getSbu(): number {
  const raw = process.env.NETSEG_SBU;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 460; // valor de referencia si no se configura
}

export type CalculoRol = {
  aportePersonalIess: number;
  aportePatronalIess: number;
  decimoTercero: number;
  decimoCuarto: number;
  totalIngresos: number;
  totalDescuentos: number;
  liquidoRecibir: number;
};

export function calcularRolPagos(params: {
  salarioMensual: number;
  horasExtras: number;
  otrosIngresos: number;
  otrosDescuentos: number;
  impuestoRenta: number;
}): CalculoRol {
  const { salarioMensual, horasExtras, otrosIngresos, otrosDescuentos, impuestoRenta } = params;
  const sbu = getSbu();

  const aportePersonalIess = round2(salarioMensual * (IESS_PERSONAL_PCT / 100));
  const aportePatronalIess = round2(salarioMensual * (IESS_PATRONAL_PCT / 100));
  const decimoTercero = round2(salarioMensual / 12);
  const decimoCuarto = round2(sbu / 12);

  const totalIngresos = round2(salarioMensual + horasExtras + otrosIngresos + decimoTercero + decimoCuarto);
  const totalDescuentos = round2(aportePersonalIess + impuestoRenta + otrosDescuentos);
  const liquidoRecibir = round2(totalIngresos - totalDescuentos);

  return { aportePersonalIess, aportePatronalIess, decimoTercero, decimoCuarto, totalIngresos, totalDescuentos, liquidoRecibir };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
