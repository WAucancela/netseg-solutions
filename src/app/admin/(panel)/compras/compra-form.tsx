"use client";

import { useActionState, useState } from "react";
import type { CompraFormState } from "./actions";

const initialState: CompraFormState = { error: "" };

type Linea = { productoId: string; cantidad: string; costoUnitario: string };

type CompraInicial = {
  proveedorId: string;
  fecha: string;
  estado: string;
  notas: string | null;
  lineas: Linea[];
};

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function CompraForm({
  action,
  proveedores,
  productos,
  soloLectura,
  inicial,
}: {
  action: (prevState: CompraFormState, formData: FormData) => Promise<CompraFormState>;
  proveedores: { id: string; nombre: string }[];
  productos: { id: string; nombre: string }[];
  soloLectura?: boolean;
  inicial?: CompraInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [lineas, setLineas] = useState<Linea[]>(
    inicial?.lineas && inicial.lineas.length > 0
      ? inicial.lineas
      : [{ productoId: productos[0]?.id ?? "", cantidad: "1", costoUnitario: "" }]
  );

  function updateLinea(i: number, field: keyof Linea, value: string) {
    setLineas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }
  function addLinea() {
    setLineas((prev) => [...prev, { productoId: productos[0]?.id ?? "", cantidad: "1", costoUnitario: "" }]);
  }
  function removeLinea(i: number) {
    setLineas((prev) => prev.filter((_, idx) => idx !== i));
  }

  const total = lineas.reduce((acc, l) => acc + (Number(l.cantidad) || 0) * (Number(l.costoUnitario) || 0), 0);

  return (
    <form action={formAction} className="admin-card">
      <fieldset disabled={soloLectura} style={{ border: "none", padding: 0, margin: 0 }}>
        <input type="hidden" name="lineasJson" value={JSON.stringify(lineas)} />

        <div className="row2">
          <div className="field">
            <label htmlFor="proveedorId">Proveedor</label>
            <select id="proveedorId" name="proveedorId" defaultValue={inicial?.proveedorId ?? ""} required>
              <option value="" disabled>
                Selecciona un proveedor
              </option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="estado">Estado</label>
            <select id="estado" name="estado" defaultValue={inicial?.estado ?? "BORRADOR"}>
              <option value="BORRADOR">Borrador</option>
              <option value="ENVIADA">Enviada al proveedor</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="fecha">Fecha</label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            defaultValue={inicial?.fecha ? inicial.fecha.slice(0, 10) : new Date().toISOString().slice(0, 10)}
          />
        </div>

        <div className="field" style={{ marginTop: 6 }}>
          <label>Líneas</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lineas.map((l, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 120px auto", gap: 8, alignItems: "center" }}>
                <select value={l.productoId} onChange={(e) => updateLinea(i, "productoId", e.target.value)}>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Cant."
                  value={l.cantidad}
                  onChange={(e) => updateLinea(i, "cantidad", e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Costo unit."
                  value={l.costoUnitario}
                  onChange={(e) => updateLinea(i, "costoUnitario", e.target.value)}
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeLinea(i)} disabled={lineas.length === 1}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addLinea}>
            Agregar línea
          </button>
        </div>

        <div className="admin-card" style={{ background: "var(--surface-2)", marginTop: 14, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
            <span>Total</span>
            <span className="mono">{fmt(total)}</span>
          </div>
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="notas">Notas</label>
          <textarea id="notas" name="notas" defaultValue={inicial?.notas ?? ""} rows={2} />
        </div>

        {state.error && <p className="form-note error">{state.error}</p>}

        {!soloLectura && (
          <button className="btn btn-primary" type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar orden de compra"}
          </button>
        )}
      </fieldset>
    </form>
  );
}
