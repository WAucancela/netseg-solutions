"use client";

import { useActionState } from "react";
import type { ContratoFormState } from "./actions";

const initialState: ContratoFormState = { error: "" };

type ContratoInicial = {
  clienteNombre: string;
  clienteEmail: string | null;
  clienteTelefono: string | null;
  paqueteId: string | null;
  modalidad: string;
  montoMensual: number | null;
  periodicidad: string;
  proximaFactura: string | null;
  estado: string;
  notas: string | null;
};

export function ContratoForm({
  action,
  paquetes,
  inicial,
}: {
  action: (prevState: ContratoFormState, formData: FormData) => Promise<ContratoFormState>;
  paquetes: { id: string; nombre: string }[];
  inicial?: ContratoInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="admin-card">
      <div className="row2">
        <div className="field">
          <label htmlFor="clienteNombre">Cliente</label>
          <input id="clienteNombre" name="clienteNombre" type="text" defaultValue={inicial?.clienteNombre} required />
        </div>
        <div className="field">
          <label htmlFor="paqueteId">Paquete</label>
          <select id="paqueteId" name="paqueteId" defaultValue={inicial?.paqueteId ?? ""}>
            <option value="">Sin paquete / a medida</option>
            {paquetes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="clienteEmail">Correo del cliente</label>
          <input id="clienteEmail" name="clienteEmail" type="email" defaultValue={inicial?.clienteEmail ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="clienteTelefono">Teléfono del cliente</label>
          <input id="clienteTelefono" name="clienteTelefono" type="tel" defaultValue={inicial?.clienteTelefono ?? ""} />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="modalidad">Modalidad</label>
          <select id="modalidad" name="modalidad" defaultValue={inicial?.modalidad ?? "COMPRA"}>
            <option value="COMPRA">Compra directa</option>
            <option value="SECAAS">Renta mensual (SECaaS)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" defaultValue={inicial?.estado ?? "ACTIVO"}>
            <option value="ACTIVO">Activo</option>
            <option value="PAUSADO">Pausado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="montoMensual">Monto mensual (si aplica)</label>
          <input id="montoMensual" name="montoMensual" type="number" step="0.01" defaultValue={inicial?.montoMensual ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="periodicidad">Periodicidad de cobro</label>
          <select id="periodicidad" name="periodicidad" defaultValue={inicial?.periodicidad ?? "MENSUAL"}>
            <option value="MENSUAL">Mensual</option>
            <option value="TRIMESTRAL">Trimestral</option>
            <option value="ANUAL">Anual</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="proximaFactura">Próxima fecha de cobro</label>
        <input
          id="proximaFactura"
          name="proximaFactura"
          type="date"
          defaultValue={inicial?.proximaFactura ? inicial.proximaFactura.slice(0, 10) : ""}
        />
      </div>

      <div className="field">
        <label htmlFor="notas">Notas</label>
        <textarea id="notas" name="notas" defaultValue={inicial?.notas ?? ""} rows={3} />
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar contrato"}
      </button>
    </form>
  );
}
