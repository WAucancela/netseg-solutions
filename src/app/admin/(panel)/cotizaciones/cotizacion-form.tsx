"use client";

import { useActionState, useState } from "react";
import type { CotizacionFormState } from "./actions";
import type { ActividadCronograma, TipoActividadCronograma } from "@/lib/cronograma";

const initialState: CotizacionFormState = { error: "" };

type Linea = { categoria: string; descripcion: string; cantidad: string; unidad: string; precioUnitario: string };

type CotizacionInicial = {
  clienteId: string;
  fecha: string;
  validaHasta: string | null;
  ivaPct: number;
  margenAplicadoPct: number | null;
  estado: string;
  proyecto: string | null;
  ubicacion: string | null;
  resumenEjecutivo: string | null;
  tiempoEjecucion: string | null;
  validezOferta: string | null;
  criterioCalculo: string | null;
  notasTerminos: string | null;
  cronograma: ActividadCronograma[];
  notas: string | null;
  lineas: Linea[];
};

function totales(lineas: Linea[], ivaPct: number) {
  const subtotal = lineas.reduce((acc, l) => acc + (Number(l.cantidad) || 0) * (Number(l.precioUnitario) || 0), 0);
  const iva = subtotal * (ivaPct / 100);
  return { subtotal, iva, total: subtotal + iva };
}

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TIPOS_ACTIVIDAD: { value: TipoActividadCronograma; label: string }[] = [
  { value: "sitio", label: "Trabajo en sitio" },
  { value: "taller", label: "Fabricación en taller" },
  { value: "hito", label: "Hito de entrega" },
];

export function CotizacionForm({
  action,
  clientes,
  clientePreseleccionado,
  esNuevaVersion,
  inicial,
}: {
  action: (prevState: CotizacionFormState, formData: FormData) => Promise<CotizacionFormState>;
  clientes: { id: string; razonSocial: string }[];
  clientePreseleccionado?: string;
  esNuevaVersion?: boolean;
  inicial?: CotizacionInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [lineas, setLineas] = useState<Linea[]>(
    inicial?.lineas && inicial.lineas.length > 0
      ? inicial.lineas
      : [{ categoria: "", descripcion: "", cantidad: "1", unidad: "u", precioUnitario: "" }]
  );
  const [ivaPct, setIvaPct] = useState(inicial?.ivaPct ?? 15);
  const [cronograma, setCronograma] = useState<ActividadCronograma[]>(inicial?.cronograma ?? []);

  function updateLinea(i: number, field: keyof Linea, value: string) {
    setLineas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }
  function addLinea() {
    setLineas((prev) => [...prev, { categoria: "", descripcion: "", cantidad: "1", unidad: "u", precioUnitario: "" }]);
  }
  function removeLinea(i: number) {
    setLineas((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateActividad(i: number, field: keyof ActividadCronograma, value: string | number) {
    setCronograma((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  }
  function addActividad() {
    setCronograma((prev) => [...prev, { seccion: "", actividad: "", diaInicio: 1, duracionDias: 1, tipo: "sitio" }]);
  }
  function removeActividad(i: number) {
    setCronograma((prev) => prev.filter((_, idx) => idx !== i));
  }

  const { subtotal, iva, total } = totales(lineas, ivaPct);

  return (
    <form action={formAction} className="admin-card">
      <input
        type="hidden"
        name="lineasJson"
        value={JSON.stringify(lineas.map((l) => ({ ...l, cantidad: Number(l.cantidad), precioUnitario: Number(l.precioUnitario) })))}
      />
      <input type="hidden" name="cronogramaJson" value={JSON.stringify(cronograma)} />

      {esNuevaVersion && (
        <p className="form-note" style={{ marginBottom: 14, color: "var(--accent)" }}>
          Esta cotización ya fue enviada. Al guardar se crea una <strong>nueva versión</strong> — la actual queda
          congelada tal cual se envió.
        </p>
      )}

      <div className="row2">
        <div className="field">
          <label htmlFor="clienteId">Cliente</label>
          <select id="clienteId" name="clienteId" defaultValue={inicial?.clienteId ?? clientePreseleccionado ?? ""} required>
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
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" defaultValue={inicial?.estado ?? "BORRADOR"}>
            <option value="BORRADOR">Borrador</option>
            <option value="ENVIADA">Enviada</option>
            <option value="ACEPTADA">Aceptada</option>
            <option value="RECHAZADA">Rechazada</option>
            <option value="VENCIDA">Vencida</option>
          </select>
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="fecha">Fecha</label>
          <input id="fecha" name="fecha" type="date" defaultValue={inicial?.fecha ? inicial.fecha.slice(0, 10) : new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="field">
          <label htmlFor="validaHasta">Válida hasta</label>
          <input id="validaHasta" name="validaHasta" type="date" defaultValue={inicial?.validaHasta ? inicial.validaHasta.slice(0, 10) : ""} />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="proyecto">Proyecto</label>
          <input id="proyecto" name="proyecto" type="text" defaultValue={inicial?.proyecto ?? ""} placeholder="Ej: Cerco eléctrico 200 m · 5 hilos · 2 esquinas" />
        </div>
        <div className="field">
          <label htmlFor="ubicacion">Ubicación</label>
          <input id="ubicacion" name="ubicacion" type="text" defaultValue={inicial?.ubicacion ?? ""} placeholder="Ciudad / sector" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="resumenEjecutivo">Resumen ejecutivo (texto que aparece en el PDF, sección 1)</label>
        <textarea id="resumenEjecutivo" name="resumenEjecutivo" defaultValue={inicial?.resumenEjecutivo ?? ""} rows={3} />
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="tiempoEjecucion">Tiempo de ejecución</label>
          <input id="tiempoEjecucion" name="tiempoEjecucion" type="text" defaultValue={inicial?.tiempoEjecucion ?? ""} placeholder="Ej: 6 días laborables desde el anticipo" />
        </div>
        <div className="field">
          <label htmlFor="validezOferta">Validez de la oferta</label>
          <input id="validezOferta" name="validezOferta" type="text" defaultValue={inicial?.validezOferta ?? ""} placeholder="Ej: 15 días calendario" />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="ivaPct">IVA (%)</label>
          <input
            id="ivaPct"
            name="ivaPct"
            type="number"
            step="0.1"
            value={ivaPct}
            onChange={(e) => setIvaPct(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="margenAplicadoPct">Margen aplicado (%, interno)</label>
          <input id="margenAplicadoPct" name="margenAplicadoPct" type="number" step="0.1" defaultValue={inicial?.margenAplicadoPct ?? ""} />
        </div>
      </div>

      <div className="field" style={{ marginTop: 6 }}>
        <label>Líneas de detalle</label>
        <p style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: -4, marginBottom: 8 }}>
          La categoría agrupa líneas consecutivas bajo un mismo encabezado en el PDF (ej. &quot;EQUIPOS DE
          ENERGIZACIÓN&quot;). Déjala vacía si no necesitas agrupar.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lineas.map((l, i) => (
            <div
              key={i}
              style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}
            >
              <input
                type="text"
                placeholder="Categoría (opcional, ej. ESTRUCTURA Y TENDIDO)"
                value={l.categoria}
                onChange={(e) => updateLinea(i, "categoria", e.target.value)}
                style={{ fontSize: ".82rem" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 70px 100px auto", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Descripción"
                  value={l.descripcion}
                  onChange={(e) => updateLinea(i, "descripcion", e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Cant."
                  value={l.cantidad}
                  onChange={(e) => updateLinea(i, "cantidad", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Unid."
                  value={l.unidad}
                  onChange={(e) => updateLinea(i, "unidad", e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Precio unit."
                  value={l.precioUnitario}
                  onChange={(e) => updateLinea(i, "precioUnitario", e.target.value)}
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeLinea(i)} disabled={lineas.length === 1}>
                  Quitar
                </button>
              </div>
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
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", marginBottom: 4 }}>
          <span>IVA ({ivaPct}%)</span>
          <span className="mono">{fmt(iva)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
          <span>Total</span>
          <span className="mono">{fmt(total)}</span>
        </div>
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="criterioCalculo">Criterio de cálculo (nota técnica al pie de la tabla en el PDF)</label>
        <textarea id="criterioCalculo" name="criterioCalculo" defaultValue={inicial?.criterioCalculo ?? ""} rows={2} />
      </div>

      <div className="field" style={{ marginTop: 18 }}>
        <label>Cronograma de trabajo (sección 3 del PDF)</label>
        <p style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: -4, marginBottom: 8 }}>
          Día 1 = primer día laborable. Las actividades con la misma sección consecutivas se agrupan bajo un mismo
          encabezado (ej. PREPARACIÓN, OBRA, ENTREGA). Si no agregas ninguna actividad, el PDF omite esta sección.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cronograma.map((a, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 1fr 70px 70px 140px auto", gap: 8, alignItems: "center" }}>
              <input type="text" placeholder="Sección" value={a.seccion} onChange={(e) => updateActividad(i, "seccion", e.target.value)} />
              <input type="text" placeholder="Actividad" value={a.actividad} onChange={(e) => updateActividad(i, "actividad", e.target.value)} />
              <input
                type="number"
                min={1}
                placeholder="Día inicio"
                value={a.diaInicio}
                onChange={(e) => updateActividad(i, "diaInicio", Number(e.target.value))}
              />
              <input
                type="number"
                min={1}
                placeholder="Duración"
                value={a.duracionDias}
                onChange={(e) => updateActividad(i, "duracionDias", Number(e.target.value))}
              />
              <select value={a.tipo} onChange={(e) => updateActividad(i, "tipo", e.target.value)}>
                {TIPOS_ACTIVIDAD.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeActividad(i)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addActividad}>
          Agregar actividad
        </button>
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="notasTerminos">Notas adicionales a los términos (opcional, se suman a la plantilla fija)</label>
        <textarea id="notasTerminos" name="notasTerminos" defaultValue={inicial?.notasTerminos ?? ""} rows={2} />
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="notas">Notas internas (no salen en el PDF)</label>
        <textarea id="notas" name="notas" defaultValue={inicial?.notas ?? ""} rows={2} />
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : esNuevaVersion ? "Guardar como nueva versión" : "Guardar cotización"}
      </button>
    </form>
  );
}
