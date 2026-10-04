"use client";

import { useActionState, useRef } from "react";
import { agregarChecklistItems, type ChecklistFormState } from "@/app/admin/(panel)/proyectos/actions";

const initialState: ChecklistFormState = { error: "" };

export function ChecklistForm({ tareaId }: { tareaId: string }) {
  const action = agregarChecklistItems.bind(null, tareaId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      style={{ marginTop: 14 }}
    >
      <div className="field">
        <label htmlFor="items">Agregar puntos (uno por línea, inician en amarillo)</label>
        <textarea id="items" name="items" rows={3} placeholder={"Cableado certificado\nEquipos etiquetados\nCliente capacitado en el uso"} />
      </div>
      {state.error && <p className="form-note error">{state.error}</p>}
      <button className="btn btn-ghost btn-sm" type="submit" disabled={isPending}>
        {isPending ? "Agregando..." : "Agregar al checklist"}
      </button>
    </form>
  );
}
