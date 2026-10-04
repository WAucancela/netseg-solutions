"use client";

import { useActionState, useRef } from "react";
import { crearTarea, type TareaFormState } from "../actions";

const initialState: TareaFormState = { error: "" };

export function TareaForm({
  proyectoId,
  tecnicos,
}: {
  proyectoId: string;
  tecnicos: { id: string; nombre: string }[];
}) {
  const action = crearTarea.bind(null, proyectoId);
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
      <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Agregar tarea</h2>
      <div className="row2">
        <div className="field">
          <label htmlFor="tipo">Tipo</label>
          <select id="tipo" name="tipo" defaultValue="INSPECCION">
            <option value="INSPECCION">Inspección</option>
            <option value="INSTALACION">Instalación</option>
            <option value="SOPORTE">Soporte</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="titulo">Título</label>
          <input id="titulo" name="titulo" type="text" required />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="tecnicoId">Técnico asignado</label>
          <select id="tecnicoId" name="tecnicoId" defaultValue="">
            <option value="">Sin asignar</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fechaProgramada">Fecha programada</label>
          <input id="fechaProgramada" name="fechaProgramada" type="date" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows={2} />
      </div>
      {state.error && <p className="form-note error">{state.error}</p>}
      <button className="btn btn-primary btn-sm" type="submit" disabled={isPending}>
        {isPending ? "Agregando..." : "Agregar tarea"}
      </button>
    </form>
  );
}
