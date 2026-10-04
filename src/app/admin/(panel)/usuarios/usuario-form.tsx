"use client";

import { useActionState, useState } from "react";
import type { UsuarioFormState } from "./actions";

const initialState: UsuarioFormState = { error: "" };

type UsuarioInicial = {
  nombre: string;
  email: string;
  rol: string;
  clienteId: string | null;
  activo: boolean;
};

export function UsuarioForm({
  action,
  clientes,
  inicial,
}: {
  action: (prevState: UsuarioFormState, formData: FormData) => Promise<UsuarioFormState>;
  clientes: { id: string; razonSocial: string }[];
  inicial?: UsuarioInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [rol, setRol] = useState(inicial?.rol ?? "TECNICO");

  return (
    <form action={formAction} className="admin-card">
      <div className="row2">
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" defaultValue={inicial?.nombre} required />
        </div>
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" defaultValue={inicial?.email} required />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="rol">Rol</label>
          <select id="rol" name="rol" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="ADMIN">Administrador</option>
            <option value="TECNICO">Técnico</option>
            <option value="CLIENTE">Cliente</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="password">
            {inicial ? "Nueva contraseña (opcional)" : "Contraseña"}
          </label>
          <input id="password" name="password" type="password" minLength={8} required={!inicial} />
        </div>
      </div>

      {rol === "CLIENTE" && (
        <div className="field">
          <label htmlFor="clienteId">Cliente asociado</label>
          <select id="clienteId" name="clienteId" defaultValue={inicial?.clienteId ?? ""}>
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
      )}

      <div className="field">
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" name="activo" defaultChecked={inicial?.activo ?? true} />
          Activo (puede iniciar sesión)
        </label>
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar usuario"}
      </button>
    </form>
  );
}
