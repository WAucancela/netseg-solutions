"use client";

import { useActionState } from "react";
import type { PaqueteFormState } from "./actions";

const initialState: PaqueteFormState = { error: "" };

type PaqueteInicial = {
  nombre: string;
  descripcionAlcance: string;
  precioDesde: number | null;
  notaPrecio: string | null;
  destacado: boolean;
  premium: boolean;
  activo: boolean;
  orden: number;
  items: string[];
};

export function PaqueteForm({
  action,
  inicial,
}: {
  action: (prevState: PaqueteFormState, formData: FormData) => Promise<PaqueteFormState>;
  inicial?: PaqueteInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="admin-card">
      <div className="field">
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" type="text" defaultValue={inicial?.nombre} required />
      </div>

      <div className="field">
        <label htmlFor="descripcionAlcance">Alcance (descripción corta)</label>
        <textarea id="descripcionAlcance" name="descripcionAlcance" defaultValue={inicial?.descripcionAlcance} rows={2} required />
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="precioDesde">Precio desde (vacío = cotización personalizada)</label>
          <input id="precioDesde" name="precioDesde" type="number" step="1" defaultValue={inicial?.precioDesde ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="notaPrecio">Nota del precio</label>
          <input id="notaPrecio" name="notaPrecio" type="text" defaultValue={inicial?.notaPrecio ?? ""} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="items">Incluye (uno por línea)</label>
        <textarea id="items" name="items" defaultValue={inicial?.items.join("\n")} rows={4} />
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="orden">Orden</label>
          <input id="orden" name="orden" type="number" defaultValue={inicial?.orden ?? 0} />
        </div>
        <div className="field" style={{ gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
            <input type="checkbox" name="destacado" defaultChecked={inicial?.destacado ?? false} />
            Destacar como &quot;Más solicitado&quot;
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="premium" defaultChecked={inicial?.premium ?? false} />
            Estilo premium (a la medida)
          </label>
        </div>
      </div>

      <div className="field">
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" name="activo" defaultChecked={inicial?.activo ?? true} />
          Activo (visible en la página pública)
        </label>
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar paquete"}
      </button>
    </form>
  );
}
