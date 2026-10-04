"use client";

import { useActionState } from "react";
import type { ProyectoFormState } from "./actions";

const initialState: ProyectoFormState = { error: "" };

type ProyectoInicial = {
  clienteId: string;
  nombre: string;
  descripcion: string | null;
  estado: string;
  presupuestoAprobado: number | null;
  margenMetaPct: number | null;
  fechaInicio: string | null;
  fechaFin: string | null;
};

export function ProyectoForm({
  action,
  clientes,
  clientePreseleccionado,
  inicial,
}: {
  action: (prevState: ProyectoFormState, formData: FormData) => Promise<ProyectoFormState>;
  clientes: { id: string; razonSocial: string }[];
  clientePreseleccionado?: string;
  inicial?: ProyectoInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="admin-card">
      <div className="row2">
        <div className="field">
          <label htmlFor="clienteId">Cliente</label>
          <select id="clienteId" name="clienteId" defaultValue={inicial?.clienteId ?? clientePreseleccionado ?? ""} required>
            <option value="" disabled>
              Selecciona un cliente
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.razonSocial}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="nombre">Nombre del proyecto</label>
          <input id="nombre" name="nombre" type="text" defaultValue={inicial?.nombre} required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" defaultValue={inicial?.descripcion ?? ""} rows={2} />
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" defaultValue={inicial?.estado ?? "PLANIFICADO"}>
            <option value="PLANIFICADO">Planificado</option>
            <option value="EN_PROGRESO">En progreso</option>
            <option value="COMPLETADO">Completado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="presupuestoAprobado">Presupuesto aprobado</label>
          <input
            id="presupuestoAprobado"
            name="presupuestoAprobado"
            type="number"
            step="0.01"
            defaultValue={inicial?.presupuestoAprobado ?? ""}
          />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="margenMetaPct">Margen meta (%)</label>
          <input id="margenMetaPct" name="margenMetaPct" type="number" step="0.1" defaultValue={inicial?.margenMetaPct ?? ""} />
        </div>
        <div />
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="fechaInicio">Fecha de inicio</label>
          <input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            defaultValue={inicial?.fechaInicio ? inicial.fechaInicio.slice(0, 10) : ""}
          />
        </div>
        <div className="field">
          <label htmlFor="fechaFin">Fecha de fin</label>
          <input id="fechaFin" name="fechaFin" type="date" defaultValue={inicial?.fechaFin ? inicial.fechaFin.slice(0, 10) : ""} />
        </div>
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar proyecto"}
      </button>
    </form>
  );
}
