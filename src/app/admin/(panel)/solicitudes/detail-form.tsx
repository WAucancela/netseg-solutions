"use client";

import { useState, useTransition } from "react";
import { EstadoSolicitud } from "@/generated/prisma/client";
import { actualizarEstadoSolicitud, guardarNotasSolicitud } from "./actions";

const ESTADOS: EstadoSolicitud[] = ["NUEVA", "EN_PROCESO", "RESUELTA", "CANCELADA"];

export function SolicitudDetailForm({
  id,
  estadoInicial,
  notasIniciales,
}: {
  id: string;
  estadoInicial: EstadoSolicitud;
  notasIniciales: string;
}) {
  const [estado, setEstado] = useState(estadoInicial);
  const [notas, setNotas] = useState(notasIniciales);
  const [savedNotas, setSavedNotas] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onEstadoChange(nuevo: EstadoSolicitud) {
    setEstado(nuevo);
    startTransition(() => actualizarEstadoSolicitud(id, nuevo));
  }

  function onGuardarNotas() {
    startTransition(async () => {
      await guardarNotasSolicitud(id, notas);
      setSavedNotas(true);
      setTimeout(() => setSavedNotas(false), 1800);
    });
  }

  return (
    <div className="admin-card" style={{ marginTop: 16 }}>
      <div className="field">
        <label htmlFor="estado">Estado</label>
        <select
          id="estado"
          value={estado}
          disabled={isPending}
          onChange={(e) => onEstadoChange(e.target.value as EstadoSolicitud)}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="notas">Notas internas</label>
        <textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} rows={5} />
      </div>
      <div className="copy-msg">
        <button type="button" className="btn btn-primary btn-sm" onClick={onGuardarNotas} disabled={isPending}>
          Guardar notas
        </button>
        {savedNotas && <span className="form-note ok">Guardado</span>}
      </div>
    </div>
  );
}
