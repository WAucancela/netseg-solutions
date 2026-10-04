"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { guardarReceta, buscarMateriales, type RecetaFormState, type MaterialBuscado } from "./actions";

const initialState: RecetaFormState = { error: "" };

type Material = { productoId: string; nombre: string; sku: string | null; unidad: string; costoUnitario: number | null; cantidad: string };
type ServicioLinea = { servicioId: string; descripcion: string; costo: string };

type RecetaInicial = {
  manoObraHoras: number | null;
  manoObraTarifaHora: number | null;
  notas: string | null;
  materiales: Material[];
  servicios: ServicioLinea[];
};

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function BuscadorMateriales({
  productoId,
  materialesActuales,
  onAgregar,
}: {
  productoId: string;
  materialesActuales: Material[];
  onAgregar: (m: MaterialBuscado) => void;
}) {
  const [termino, setTermino] = useState("");
  const [resultados, setResultados] = useState<MaterialBuscado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = termino.trim();
    /* eslint-disable react-hooks/set-state-in-effect -- limpia/activa el estado de búsqueda
       en cuanto cambia el término, antes de que dispare el timeout del debounce */
    if (q.length < 2) {
      setResultados([]);
      setBuscando(false);
      return;
    }
    setBuscando(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const timeout = setTimeout(() => {
      buscarMateriales(q, productoId)
        .then((r) => {
          setResultados(r);
          setAbierto(true);
        })
        .finally(() => setBuscando(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [termino, productoId]);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  const yaAgregado = (id: string) => materialesActuales.some((m) => m.productoId === id);

  return (
    <div ref={contenedorRef} style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Buscar material por nombre o SKU..."
        value={termino}
        onChange={(e) => setTermino(e.target.value)}
        onFocus={() => resultados.length > 0 && setAbierto(true)}
      />
      {abierto && termino.trim().length >= 2 && (
        <div
          className="admin-card"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 20,
            maxHeight: 320,
            overflowY: "auto",
            padding: 6,
          }}
        >
          {buscando ? (
            <p style={{ color: "var(--muted)", fontSize: ".82rem", padding: 8 }}>Buscando...</p>
          ) : resultados.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: ".82rem", padding: 8 }}>Sin resultados para &quot;{termino}&quot;.</p>
          ) : (
            resultados.map((r) => {
              const agregado = yaAgregado(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onAgregar(r);
                    setTermino("");
                    setResultados([]);
                    setAbierto(false);
                  }}
                  disabled={agregado}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    cursor: agregado ? "default" : "pointer",
                    opacity: agregado ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => !agregado && (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: ".86rem" }}>
                    {r.nombre}
                    {r.sku && (
                      <span className="mono" style={{ color: "var(--muted)", marginLeft: 8, fontSize: ".78rem" }}>
                        {r.sku}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: ".78rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {agregado ? "Ya agregado" : r.costoUnitario === null ? "—" : fmt(r.costoUnitario)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function RecetaForm({
  productoId,
  serviciosDisponibles,
  inicial,
}: {
  productoId: string;
  serviciosDisponibles: { id: string; nombre: string }[];
  inicial?: RecetaInicial;
}) {
  const action = guardarReceta.bind(null, productoId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [materiales, setMateriales] = useState<Material[]>(inicial?.materiales ?? []);
  const [servicios, setServicios] = useState<ServicioLinea[]>(inicial?.servicios ?? []);
  const [manoObraHoras, setManoObraHoras] = useState(inicial?.manoObraHoras ?? 0);
  const [manoObraTarifa, setManoObraTarifa] = useState(inicial?.manoObraTarifaHora ?? 0);

  function agregarMaterial(m: MaterialBuscado) {
    setMateriales((prev) => {
      if (prev.some((x) => x.productoId === m.id)) return prev;
      return [...prev, { productoId: m.id, nombre: m.nombre, sku: m.sku, unidad: m.unidad, costoUnitario: m.costoUnitario, cantidad: "1" }];
    });
  }
  function updateCantidad(i: number, value: string) {
    setMateriales((prev) => prev.map((m, idx) => (idx === i ? { ...m, cantidad: value } : m)));
  }
  function removeMaterial(i: number) {
    setMateriales((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateServicio(i: number, field: keyof ServicioLinea, value: string) {
    setServicios((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }
  function addServicio() {
    setServicios((prev) => [...prev, { servicioId: "", descripcion: "", costo: "" }]);
  }
  function removeServicio(i: number) {
    setServicios((prev) => prev.filter((_, idx) => idx !== i));
  }

  const costoMateriales = materiales.reduce((acc, m) => acc + (Number(m.cantidad) || 0) * (m.costoUnitario ?? 0), 0);
  const costoServicios = servicios.reduce((acc, s) => acc + (Number(s.costo) || 0), 0);
  const costoManoObra = manoObraHoras * manoObraTarifa;
  const costoTotal = costoMateriales + costoServicios + costoManoObra;

  const materialesJson = JSON.stringify(materiales.map((m) => ({ productoId: m.productoId, cantidad: m.cantidad })));

  return (
    <form action={formAction} className="admin-card">
      <input type="hidden" name="materialesJson" value={materialesJson} />
      <input type="hidden" name="serviciosJson" value={JSON.stringify(servicios)} />

      <div className="field">
        <label>Materiales</label>
        <BuscadorMateriales productoId={productoId} materialesActuales={materiales} onAgregar={agregarMaterial} />

        {materiales.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 10 }}>
            Busca y haz clic en un producto de inventario para agregarlo como material.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {materiales.map((m, i) => (
              <div
                key={m.productoId}
                style={{ display: "grid", gridTemplateColumns: "1fr 100px 90px auto", gap: 8, alignItems: "center" }}
              >
                <span style={{ fontSize: ".86rem" }}>
                  {m.nombre}
                  {m.sku && (
                    <span className="mono" style={{ color: "var(--muted)", marginLeft: 8, fontSize: ".78rem" }}>
                      {m.sku}
                    </span>
                  )}
                </span>
                <input type="number" step="0.01" placeholder="Cant." value={m.cantidad} onChange={(e) => updateCantidad(i, e.target.value)} />
                <span className="mono" style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                  {m.unidad}
                </span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeMaterial(i)}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="field" style={{ marginTop: 18 }}>
        <label>Servicios incluidos (opcional)</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {servicios.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px auto", gap: 8, alignItems: "center" }}>
              <select value={s.servicioId} onChange={(e) => updateServicio(i, "servicioId", e.target.value)}>
                <option value="">Servicio libre (texto)</option>
                {serviciosDisponibles.map((sv) => (
                  <option key={sv.id} value={sv.id}>
                    {sv.nombre}
                  </option>
                ))}
              </select>
              <input type="text" placeholder="Descripción" value={s.descripcion} onChange={(e) => updateServicio(i, "descripcion", e.target.value)} />
              <input type="number" step="0.01" placeholder="Costo" value={s.costo} onChange={(e) => updateServicio(i, "costo", e.target.value)} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeServicio(i)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addServicio}>
          Agregar servicio
        </button>
      </div>

      <div className="row2" style={{ marginTop: 18 }}>
        <div className="field">
          <label htmlFor="manoObraHoras">Mano de obra (horas)</label>
          <input
            id="manoObraHoras"
            name="manoObraHoras"
            type="number"
            step="0.01"
            value={manoObraHoras}
            onChange={(e) => setManoObraHoras(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="manoObraTarifaHora">Tarifa por hora</label>
          <input
            id="manoObraTarifaHora"
            name="manoObraTarifaHora"
            type="number"
            step="0.01"
            value={manoObraTarifa}
            onChange={(e) => setManoObraTarifa(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="admin-card" style={{ background: "var(--surface-2)", marginTop: 16, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", marginBottom: 4 }}>
          <span>Materiales</span>
          <span className="mono">{fmt(costoMateriales)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", marginBottom: 4 }}>
          <span>Servicios</span>
          <span className="mono">{fmt(costoServicios)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", marginBottom: 4 }}>
          <span>Mano de obra</span>
          <span className="mono">{fmt(costoManoObra)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 8 }}>
          <span>Costo total del producto</span>
          <span className="mono">{fmt(costoTotal)}</span>
        </div>
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="notas">Notas</label>
        <textarea id="notas" name="notas" defaultValue={inicial?.notas ?? ""} rows={2} />
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar receta"}
      </button>
    </form>
  );
}
