"use client";

import { useActionState, useRef } from "react";
import { producir, type ProducirFormState } from "./actions";

const initialState: ProducirFormState = { error: "" };

export function ProducirForm({ productoId }: { productoId: string }) {
  const action = producir.bind(null, productoId);
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
      <h2 style={{ fontSize: "1rem", marginBottom: 4 }}>Producir</h2>
      <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 14 }}>
        Descuenta los materiales de la receta del stock (multiplicados por la cantidad) y suma el producto
        terminado. Se registra como movimiento de inventario.
      </p>
      <div className="row2">
        <div className="field">
          <label htmlFor="cantidad">Cantidad a producir</label>
          <input id="cantidad" name="cantidad" type="number" step="1" min="1" defaultValue={1} required />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Produciendo..." : "Producir"}
          </button>
        </div>
      </div>
      {state.error && <p className="form-note error">{state.error}</p>}
    </form>
  );
}
