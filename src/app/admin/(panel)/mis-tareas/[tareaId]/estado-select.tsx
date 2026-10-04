"use client";

import { useTransition } from "react";
import { EstadoTarea } from "@/generated/prisma/client";
import { actualizarEstadoTarea } from "../../proyectos/actions";

const ESTADOS: EstadoTarea[] = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA"];

export function EstadoSelect({
  tareaId,
  proyectoId,
  estadoInicial,
}: {
  tareaId: string;
  proyectoId: string;
  estadoInicial: EstadoTarea;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={estadoInicial}
      disabled={isPending}
      onChange={(e) => startTransition(() => actualizarEstadoTarea(tareaId, proyectoId, e.target.value as EstadoTarea))}
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>
          {e}
        </option>
      ))}
    </select>
  );
}
