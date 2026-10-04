export const MARGEN_DEFAULT_PCT = 30;

/**
 * PVP = costo + margen%. El margen del producto (si lo tiene) manda sobre el margen por
 * defecto del sistema. Sin costo unitario no hay PVP que calcular.
 *
 * Nota: este archivo se importa también desde componentes cliente (para la vista previa en
 * vivo del formulario), así que debe quedar libre de imports de Prisma/Node — ver
 * `getMargenDefaultPct` en `src/lib/precios.server.ts` para la lectura del margen por defecto.
 */
export function calcularPvp(
  costoUnitario: number | null,
  margenPct: number | null,
  margenDefaultPct: number
): number | null {
  if (costoUnitario === null) return null;
  const margen = margenPct ?? margenDefaultPct;
  return costoUnitario * (1 + margen / 100);
}
