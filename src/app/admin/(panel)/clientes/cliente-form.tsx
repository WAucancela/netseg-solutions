"use client";

import { useActionState, useState } from "react";
import type { ClienteFormState } from "./actions";
import { useConsultaRuc } from "./use-consulta-ruc";

const initialState: ClienteFormState = { error: "" };

type ClienteInicial = {
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
};

export function ClienteForm({
  action,
  inicial,
}: {
  action: (prevState: ClienteFormState, formData: FormData) => Promise<ClienteFormState>;
  inicial?: ClienteInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const { estado: estadoRuc, mensaje: mensajeRuc, buscar } = useConsultaRuc();

  const [ruc, setRuc] = useState(inicial?.ruc ?? "");
  const [razonSocial, setRazonSocial] = useState(inicial?.razonSocial ?? "");
  const [nombreComercial, setNombreComercial] = useState(inicial?.nombreComercial ?? "");
  const [direccion, setDireccion] = useState(inicial?.direccion ?? "");

  async function onRucBlur() {
    const resultado = await buscar(ruc);
    if (resultado?.ok) {
      if (!razonSocial.trim()) setRazonSocial(resultado.razonSocial);
      if (!nombreComercial.trim() && resultado.nombreComercial) setNombreComercial(resultado.nombreComercial);
      if (!direccion.trim() && resultado.direccion) setDireccion(resultado.direccion);
    }
  }

  return (
    <form action={formAction} className="admin-card">
      <div className="row2">
        <div className="field">
          <label htmlFor="ruc">RUC o cédula</label>
          <input
            id="ruc"
            name="ruc"
            type="text"
            value={ruc}
            onChange={(e) => setRuc(e.target.value)}
            onBlur={onRucBlur}
            required
          />
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
      <div className="field">
        <label htmlFor="nombreComercial">Nombre comercial</label>
        <input
          id="nombreComercial"
          name="nombreComercial"
          type="text"
          value={nombreComercial}
          onChange={(e) => setNombreComercial(e.target.value)}
        />
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
        <label htmlFor="direccion">Dirección</label>
        <input id="direccion" name="direccion" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="notas">Notas</label>
        <textarea id="notas" name="notas" defaultValue={inicial?.notas ?? ""} rows={3} />
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar cliente"}
      </button>
    </form>
  );
}
