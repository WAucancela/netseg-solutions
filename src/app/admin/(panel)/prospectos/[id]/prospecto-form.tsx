"use client";

import { useActionState } from "react";
import { guardarProspecto, type ProspectoFormState } from "../actions";

const initialState: ProspectoFormState = { error: "" };

type ProspectoInicial = {
  nombre: string;
  empresa: string | null;
  email: string | null;
  telefono: string | null;
  servicioInteres: string | null;
  mensaje: string | null;
};

export function ProspectoForm({ id, inicial }: { id: string; inicial: ProspectoInicial }) {
  const action = guardarProspecto.bind(null, id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="admin-card">
      <div className="row2">
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" defaultValue={inicial.nombre} required />
        </div>
        <div className="field">
          <label htmlFor="empresa">Empresa</label>
          <input id="empresa" name="empresa" type="text" defaultValue={inicial.empresa ?? ""} />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" defaultValue={inicial.email ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="telefono">Teléfono</label>
          <input id="telefono" name="telefono" type="tel" defaultValue={inicial.telefono ?? ""} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="servicioInteres">Servicio de interés</label>
        <input id="servicioInteres" name="servicioInteres" type="text" defaultValue={inicial.servicioInteres ?? ""} />
      </div>
      <div className="field">
        <label htmlFor="mensaje">Mensaje</label>
        <textarea id="mensaje" name="mensaje" defaultValue={inicial.mensaje ?? ""} rows={3} />
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar prospecto"}
      </button>
    </form>
  );
}
