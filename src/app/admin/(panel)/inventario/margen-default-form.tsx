"use client";

import { useActionState } from "react";
import { guardarMargenDefault, type MargenFormState } from "./actions";

const initialState: MargenFormState = { error: "" };

export function MargenDefaultForm({ margenDefaultPct }: { margenDefaultPct: number }) {
  const [state, formAction, isPending] = useActionState(guardarMargenDefault, initialState);

  return (
    <div className="admin-card" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1rem", marginBottom: 4 }}>Precio de venta (PVP)</h2>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", maxWidth: 560 }}>
            El PVP se calcula como costo unitario + margen de ganancia. Este es el margen que se usa para
            todos los productos que no tengan un margen propio definido en su ficha.
          </p>
        </div>
        <form action={formAction} style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="margenDefaultPct">Margen por defecto (%)</label>
            <input
              id="margenDefaultPct"
              name="margenDefaultPct"
              type="number"
              step="0.01"
              min="0"
              defaultValue={margenDefaultPct}
              style={{ width: 120 }}
            />
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
      {state.error && <p className="form-note error">{state.error}</p>}
    </div>
  );
}
