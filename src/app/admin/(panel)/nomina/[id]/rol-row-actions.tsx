"use client";

import { useTransition } from "react";
import { EstadoRolPagos } from "@/generated/prisma/client";
import { actualizarEstadoRol, eliminarRolPagos } from "../actions";

export function RolRowActions({
  rolId,
  empleadoId,
  estado,
}: {
  rolId: string;
  empleadoId: string;
  estado: EstadoRolPagos;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select
        value={estado}
        disabled={isPending}
        onChange={(e) =>
          startTransition(() => actualizarEstadoRol(rolId, empleadoId, e.target.value as EstadoRolPagos))
        }
      >
        <option value="BORRADOR">Borrador</option>
        <option value="PAGADO">Pagado</option>
      </select>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={isPending}
        onClick={() => startTransition(() => eliminarRolPagos(rolId, empleadoId))}
      >
        Quitar
      </button>
    </div>
  );
}
