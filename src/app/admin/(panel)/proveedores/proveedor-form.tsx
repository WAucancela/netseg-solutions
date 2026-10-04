"use client";

import { useActionState } from "react";
import type { ProveedorFormState } from "./actions";

const initialState: ProveedorFormState = { error: "" };

type ProveedorInicial = {
  nombre: string;
  ruc: string | null;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  notas: string | null;
};

export function ProveedorForm({
  action,
  inicial,
}: {
  action: (prevState: ProveedorFormState, formData: FormData) => Promise<ProveedorFormState>;
  inicial?: ProveedorInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="admin-card">
      <div className="row2">
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" defaultValue={inicial?.nombre} required />
        </div>
        <div className="field">
          <label htmlFor="ruc">RUC</label>
          <input id="ruc" name="ruc" type="text" defaultValue={inicial?.ruc ?? ""} />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="contacto">Persona de contacto</label>
          <input id="contacto" name="contacto" type="text" defaultValue={inicial?.contacto ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="telefono">Teléfono</label>
          <input id="telefono" name="telefono" type="tel" defaultValue={inicial?.telefono ?? ""} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" defaultValue={inicial?.email ?? ""} />
      </div>
      <div className="field">
        <label htmlFor="notas">Notas</label>
        <textarea id="notas" name="notas" defaultValue={inicial?.notas ?? ""} rows={2} />
      </div>
      {state.error && <p className="form-note error">{state.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar proveedor"}
      </button>
    </form>
  );
}
