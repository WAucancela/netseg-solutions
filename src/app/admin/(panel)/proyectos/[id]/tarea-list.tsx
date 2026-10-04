"use client";

import Link from "next/link";
import { useTransition } from "react";
import { EstadoTarea } from "@/generated/prisma/client";
import { actualizarEstadoTarea } from "../actions";

const ESTADOS: EstadoTarea[] = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA"];

const TIPO_LABEL: Record<string, string> = {
  INSPECCION: "Inspección",
  INSTALACION: "Instalación",
  SOPORTE: "Soporte",
};

type TareaRow = {
  id: string;
  tipo: string;
  titulo: string;
  tecnicoNombre: string | null;
  estado: EstadoTarea;
  _count: { checklist: number };
};

export function TareaList({ proyectoId, tareas }: { proyectoId: string; tareas: TareaRow[] }) {
  const [isPending, startTransition] = useTransition();

  if (tareas.length === 0) {
    return <p style={{ color: "var(--muted)", fontSize: ".86rem" }}>Sin tareas todavía.</p>;
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Título</th>
          <th>Técnico</th>
          <th>Checklist</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {tareas.map((t) => (
          <tr key={t.id}>
            <td>{TIPO_LABEL[t.tipo] ?? t.tipo}</td>
            <td>
              <Link href={`/admin/proyectos/${proyectoId}/tareas/${t.id}`}>{t.titulo}</Link>
            </td>
            <td>{t.tecnicoNombre ?? "—"}</td>
            <td>{t._count.checklist}</td>
            <td>
              <select
                value={t.estado}
                disabled={isPending}
                onChange={(e) =>
                  startTransition(() => actualizarEstadoTarea(t.id, proyectoId, e.target.value as EstadoTarea))
                }
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
