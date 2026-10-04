"use client";

import { useTransition } from "react";
import { EstadoChecklist } from "@/generated/prisma/client";
import { actualizarEstadoChecklist, eliminarChecklistItem } from "@/app/admin/(panel)/proyectos/actions";

const ESTADOS: EstadoChecklist[] = ["VERDE", "AMARILLO", "ROJO"];

const DOT_COLOR: Record<EstadoChecklist, string> = {
  VERDE: "var(--good)",
  AMARILLO: "var(--warn)",
  ROJO: "var(--danger)",
};

type ItemRow = { id: string; descripcion: string; estado: EstadoChecklist };

export function ChecklistList({ items }: { items: ItemRow[] }) {
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return <p style={{ color: "var(--muted)", fontSize: ".86rem" }}>Sin puntos de checklist todavía.</p>;
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item) => (
        <li key={item.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden="true"
            style={{ width: 9, height: 9, borderRadius: "50%", background: DOT_COLOR[item.estado], flex: "none" }}
          />
          <span style={{ flex: 1, fontSize: ".9rem" }}>{item.descripcion}</span>
          <select
            value={item.estado}
            disabled={isPending}
            onChange={(e) =>
              startTransition(() => actualizarEstadoChecklist(item.id, e.target.value as EstadoChecklist))
            }
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={isPending}
            onClick={() => startTransition(() => eliminarChecklistItem(item.id))}
          >
            Quitar
          </button>
        </li>
      ))}
    </ul>
  );
}
