"use client";

import { useActionState, useRef, useEffect } from "react";
import { crearSolicitud, type SolicitudFormState } from "./actions";

const initialState: SolicitudFormState = { error: "" };

export function SolicitudForm({ activos }: { activos: { id: string; nombre: string }[] }) {
  const [state, formAction, isPending] = useActionState(crearSolicitud, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      formRef.current?.reset();
    }
    wasPending.current = isPending;
  }, [isPending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="admin-card" style={{ marginBottom: 16 }}>
      <h2 style={{ fontFamily: "var(--font-poppins)", fontSize: "1.05rem", marginBottom: 14 }}>Nueva solicitud</h2>
      <div className="row2">
        <div className="field">
          <label htmlFor="tipo">Tipo</label>
          <select id="tipo" name="tipo" defaultValue="INSPECCION">
            <option value="INSPECCION">Inspección</option>
            <option value="COTIZACION">Cotización</option>
            <option value="SOPORTE">Soporte técnico</option>
          </select>
        </div>
        {activos.length > 0 && (
          <div className="field">
            <label htmlFor="activoId">Equipo relacionado (opcional)</label>
            <select id="activoId" name="activoId" defaultValue="">
              <option value="">Ninguno en particular</option>
              {activos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="field">
        <label htmlFor="descripcion">Describe lo que necesitas</label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          placeholder="Ej: La cámara de la entrada principal dejó de grabar desde ayer."
          required
        />
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
