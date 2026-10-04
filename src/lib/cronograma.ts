export type TipoActividadCronograma = "sitio" | "taller" | "hito";

export type ActividadCronograma = {
  seccion: string;
  actividad: string;
  diaInicio: number;
  duracionDias: number;
  tipo: TipoActividadCronograma;
};

export function parseCronograma(json: unknown): ActividadCronograma[] {
  if (!Array.isArray(json)) return [];
  return json
    .map((a) => {
      if (!a || typeof a !== "object") return null;
      const r = a as Record<string, unknown>;
      const seccion = String(r.seccion ?? "").trim();
      const actividad = String(r.actividad ?? "").trim();
      const diaInicio = Number(r.diaInicio);
      const duracionDias = Number(r.duracionDias);
      const tipo = r.tipo === "taller" || r.tipo === "hito" ? r.tipo : "sitio";
      if (!actividad || !Number.isFinite(diaInicio) || !Number.isFinite(duracionDias) || duracionDias < 1) return null;
      return { seccion, actividad, diaInicio: Math.max(1, Math.round(diaInicio)), duracionDias: Math.round(duracionDias), tipo };
    })
    .filter((a): a is ActividadCronograma => a !== null);
}

export function totalDiasCronograma(actividades: ActividadCronograma[]): number {
  if (actividades.length === 0) return 0;
  return Math.max(...actividades.map((a) => a.diaInicio + a.duracionDias - 1));
}
