"use client";

import { useActionState } from "react";
import type { EmpleadoFormState } from "./actions";

const initialState: EmpleadoFormState = { error: "" };

type EmpleadoInicial = {
  nombres: string;
  apellidos: string;
  cedula: string;
  cargo: string;
  fechaIngreso: string;
  salarioMensual: number;
  email: string | null;
  telefono: string | null;
  estado: string;
};

export function EmpleadoForm({
  action,
  inicial,
}: {
  action: (prevState: EmpleadoFormState, formData: FormData) => Promise<EmpleadoFormState>;
  inicial?: EmpleadoInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="admin-card">
      <div className="row2">
        <div className="field">
          <label htmlFor="nombres">Nombres</label>
          <input id="nombres" name="nombres" type="text" defaultValue={inicial?.nombres} required />
        </div>
        <div className="field">
          <label htmlFor="apellidos">Apellidos</label>
          <input id="apellidos" name="apellidos" type="text" defaultValue={inicial?.apellidos} required />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="cedula">Cédula</label>
          <input id="cedula" name="cedula" type="text" defaultValue={inicial?.cedula} required />
        </div>
        <div className="field">
          <label htmlFor="cargo">Cargo</label>
          <input id="cargo" name="cargo" type="text" defaultValue={inicial?.cargo} required />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="fechaIngreso">Fecha de ingreso</label>
          <input id="fechaIngreso" name="fechaIngreso" type="date" defaultValue={inicial?.fechaIngreso?.slice(0, 10)} required />
        </div>
        <div className="field">
          <label htmlFor="salarioMensual">Salario mensual</label>
          <input id="salarioMensual" name="salarioMensual" type="number" step="0.01" defaultValue={inicial?.salarioMensual} required />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" defaultValue={inicial?.email ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="telefono">Teléfono</label>
          <input id="telefono" name="telefono" type="tel" defaultValue={inicial?.telefono ?? ""} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="estado">Estado</label>
        <select id="estado" name="estado" defaultValue={inicial?.estado ?? "ACTIVO"}>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>
      {state.error && <p className="form-note error">{state.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar empleado"}
      </button>
    </form>
  );
}
