"use client";

import { useActionState, useState } from "react";
import { crearClienteDesdeProspecto } from "../../clientes/actions";
import type { ClienteFormState } from "../../clientes/actions";
import { useConsultaRuc } from "../../clientes/use-consulta-ruc";

const initialState: ClienteFormState = { error: "" };

export function ConvertirForm({ prospectoId, nombreSugerido }: { prospectoId: string; nombreSugerido: string }) {
  const action = crearClienteDesdeProspecto.bind(null, prospectoId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const { estado: estadoRuc, mensaje: mensajeRuc, buscar } = useConsultaRuc();

  const [ruc, setRuc] = useState("");
  const [razonSocial, setRazonSocial] = useState(nombreSugerido);

  async function onRucBlur() {
    const resultado = await buscar(ruc);
    if (resultado?.ok && !razonSocial.trim()) setRazonSocial(resultado.razonSocial);
  }

  return (
    <form action={formAction} className="admin-card" style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Convertir a cliente</h2>
      <p style={{ color: "var(--muted)", fontSize: ".86rem", marginBottom: 14 }}>
        Crea un registro de Cliente a partir de este prospecto, para poder asociarle proyectos, activos de red y
        cotizaciones formales. El prospecto pasa a estado Ganado.
      </p>
      <div className="row2">
        <div className="field">
          <label htmlFor="ruc">RUC o cédula</label>
          <input id="ruc" name="ruc" type="text" value={ruc} onChange={(e) => setRuc(e.target.value)} onBlur={onRucBlur} required />
          {mensajeRuc && (
            <p
              className={`form-note ${estadoRuc === "error" ? "error" : estadoRuc === "encontrado" ? "ok" : ""}`}
              style={{ margin: "4px 0 0" }}
            >
              {mensajeRuc}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="razonSocial">Razón social</label>
          <input
            id="razonSocial"
            name="razonSocial"
            type="text"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            required
          />
        </div>
      </div>
      {state.error && <p className="form-note error">{state.error}</p>}
      <button className="btn btn-primary btn-sm" type="submit" disabled={isPending}>
        {isPending ? "Creando..." : "Crear cliente"}
      </button>
    </form>
  );
}
