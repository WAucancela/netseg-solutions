"use client";

import { useActionState, useRef } from "react";
import { generarRolPagos, type RolPagosFormState } from "../actions";

const initialState: RolPagosFormState = { error: "" };

export function RolForm({ empleadoId }: { empleadoId: string }) {
  const action = generarRolPagos.bind(null, empleadoId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hoy = new Date();
  const periodoDefault = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;

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
      <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Generar rol de pagos</h2>
      <div className="row2">
        <div className="field">
          <label htmlFor="periodo">Período (AAAA-MM)</label>
          <input id="periodo" name="periodo" type="text" defaultValue={periodoDefault} placeholder="2026-10" required />
        </div>
        <div className="field">
          <label htmlFor="horasExtras">Horas extras ($)</label>
          <input id="horasExtras" name="horasExtras" type="number" step="0.01" defaultValue={0} />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="otrosIngresos">Otros ingresos ($)</label>
          <input id="otrosIngresos" name="otrosIngresos" type="number" step="0.01" defaultValue={0} />
        </div>
        <div className="field">
          <label htmlFor="otrosDescuentos">Otros descuentos ($)</label>
          <input id="otrosDescuentos" name="otrosDescuentos" type="number" step="0.01" defaultValue={0} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="impuestoRenta">Impuesto a la renta ($, confirmar con contador)</label>
        <input id="impuestoRenta" name="impuestoRenta" type="number" step="0.01" defaultValue={0} />
      </div>
      {state.error && <p className="form-note error">{state.error}</p>}
      <button className="btn btn-primary btn-sm" type="submit" disabled={isPending}>
        {isPending ? "Calculando..." : "Generar rol de pagos"}
      </button>
    </form>
  );
}
