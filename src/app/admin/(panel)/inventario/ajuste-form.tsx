"use client";

import { useActionState, useRef } from "react";
import { ajustarStock, type AjusteFormState } from "./actions";

const initialState: AjusteFormState = { error: "" };

export function AjusteForm({ productoId }: { productoId: string }) {
  const action = ajustarStock.bind(null, productoId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="admin-card"
      style={{ marginTop: 16 }}
    >
      <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Ajustar stock</h2>
      <div className="row2">
        <div className="field">
          <label htmlFor="tipo">Tipo de movimiento</label>
          <select id="tipo" name="tipo" defaultValue="AJUSTE">
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
            <option value="AJUSTE">Ajuste (conteo físico)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="cantidad">Cantidad</label>
          <input id="cantidad" name="cantidad" type="number" step="0.01" min="0" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="motivo">Motivo</label>
        <input id="motivo" name="motivo" type="text" placeholder="Instalación proyecto X, conteo mensual, merma..." />
      </div>
      {state.error && <p className="form-note error">{state.error}</p>}
      <button className="btn btn-ghost btn-sm" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Registrar movimiento"}
      </button>
    </form>
  );
}
