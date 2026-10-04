"use client";

import { useActionState } from "react";
import { CATEGORIA_OPCIONES } from "@/lib/taxonomia";
import type { ServicioFormState } from "./actions";

const initialState: ServicioFormState = { error: "" };

type ServicioInicial = {
  nombre: string;
  categoria: string;
  descripcion: string;
  destacado: boolean;
  activo: boolean;
  orden: number;
  items: string[];
};

export function ServicioForm({
  action,
  inicial,
}: {
  action: (prevState: ServicioFormState, formData: FormData) => Promise<ServicioFormState>;
  inicial?: ServicioInicial;
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
          <label htmlFor="categoria">Categoría</label>
          <select id="categoria" name="categoria" defaultValue={inicial?.categoria ?? CATEGORIA_OPCIONES[0].codigo}>
            {CATEGORIA_OPCIONES.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {c.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" defaultValue={inicial?.descripcion} rows={3} required />
      </div>

      <div className="field">
        <label htmlFor="items">Puntos de alcance (uno por línea, opcional)</label>
        <textarea id="items" name="items" defaultValue={inicial?.items.join("\n")} rows={4} />
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="orden">Orden</label>
          <input id="orden" name="orden" type="number" defaultValue={inicial?.orden ?? 0} />
        </div>
        <div className="field">
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
            <input type="checkbox" name="destacado" defaultChecked={inicial?.destacado ?? true} />
            Mostrar en servicios principales
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
        {isPending ? "Guardando..." : "Guardar servicio"}
      </button>
    </form>
  );
}
