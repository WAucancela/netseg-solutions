"use client";

import { useActionState, useState } from "react";
import { crearFactura, type FacturaFormState } from "./actions";

const initialState: FacturaFormState = { error: "" };

type Linea = { descripcion: string; cantidad: string; precioUnitario: string };

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function FacturaForm({
  clientes,
  clientePreseleccionado,
}: {
  clientes: { id: string; razonSocial: string }[];
  clientePreseleccionado?: string;
}) {
  const [state, formAction, isPending] = useActionState(crearFactura, initialState);
  const [lineas, setLineas] = useState<Linea[]>([{ descripcion: "", cantidad: "1", precioUnitario: "" }]);
  const [ivaPct, setIvaPct] = useState(15);

  function updateLinea(i: number, field: keyof Linea, value: string) {
    setLineas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }
  function addLinea() {
    setLineas((prev) => [...prev, { descripcion: "", cantidad: "1", precioUnitario: "" }]);
  }
  function removeLinea(i: number) {
    setLineas((prev) => prev.filter((_, idx) => idx !== i));
  }

  const subtotal = lineas.reduce((acc, l) => acc + (Number(l.cantidad) || 0) * (Number(l.precioUnitario) || 0), 0);
  const total = subtotal * (1 + ivaPct / 100);

  return (
    <form action={formAction} className="admin-card">
      <input type="hidden" name="lineasJson" value={JSON.stringify(lineas)} />

      <div className="row2">
        <div className="field">
          <label htmlFor="clienteId">Cliente</label>
          <select id="clienteId" name="clienteId" defaultValue={clientePreseleccionado ?? ""} required>
            <option value="" disabled>
              Selecciona un cliente
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.razonSocial}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ivaPct">IVA (%)</label>
          <input id="ivaPct" name="ivaPct" type="number" step="0.1" value={ivaPct} onChange={(e) => setIvaPct(Number(e.target.value))} />
        </div>
      </div>

      <div className="field" style={{ marginTop: 6 }}>
        <label>Líneas de detalle</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lineas.map((l, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 120px auto", gap: 8, alignItems: "center" }}>
              <input type="text" placeholder="Descripción" value={l.descripcion} onChange={(e) => updateLinea(i, "descripcion", e.target.value)} />
              <input type="number" step="0.01" placeholder="Cant." value={l.cantidad} onChange={(e) => updateLinea(i, "cantidad", e.target.value)} />
              <input type="number" step="0.01" placeholder="Precio unit." value={l.precioUnitario} onChange={(e) => updateLinea(i, "precioUnitario", e.target.value)} />
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
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", marginBottom: 4 }}>
          <span>Subtotal</span>
          <span className="mono">{fmt(subtotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
          <span>Total</span>
          <span className="mono">{fmt(total)}</span>
        </div>
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="notas">Notas</label>
        <textarea id="notas" name="notas" rows={2} />
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Crear factura (borrador)"}
      </button>
    </form>
  );
}
