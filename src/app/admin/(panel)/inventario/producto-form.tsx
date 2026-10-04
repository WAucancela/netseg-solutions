"use client";

import { useActionState, useState } from "react";
import { CATEGORIA_OPCIONES } from "@/lib/taxonomia";
import { calcularPvp } from "@/lib/precios";
import type { ProductoFormState } from "./actions";

const initialState: ProductoFormState = { error: "" };

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type ProductoInicial = {
  nombre: string;
  categoria: string;
  sku: string | null;
  unidad: string;
  tipo: string;
  stockMinimo: number;
  costoUnitario: number | null;
  margenPct: number | null;
  proveedorId: string | null;
  imagenUrl: string | null;
};

export function ProductoForm({
  action,
  proveedores,
  margenDefaultPct,
  inicial,
}: {
  action: (prevState: ProductoFormState, formData: FormData) => Promise<ProductoFormState>;
  proveedores: { id: string; nombre: string }[];
  margenDefaultPct: number;
  inicial?: ProductoInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [preview, setPreview] = useState<string | null>(inicial?.imagenUrl ?? null);
  const [quitarImagen, setQuitarImagen] = useState(false);
  const [costoUnitario, setCostoUnitario] = useState(inicial?.costoUnitario?.toString() ?? "");
  const [margenPct, setMargenPct] = useState(inicial?.margenPct?.toString() ?? "");

  const pvp = calcularPvp(costoUnitario === "" ? null : Number(costoUnitario), margenPct === "" ? null : Number(margenPct), margenDefaultPct);

  function onImagenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setQuitarImagen(false);
    }
  }

  return (
    <form action={formAction} className="admin-card">
      <div className="field">
        <label>Foto del producto</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {preview && !quitarImagen ? (
              // eslint-disable-next-line @next/next/no-img-element -- previsualización de archivo local (blob: URL) o imagen remota en Vercel Blob
              <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "var(--muted)", fontSize: ".72rem", textAlign: "center", padding: 6 }}>Sin foto</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input id="imagen" name="imagen" type="file" accept="image/*" onChange={onImagenChange} />
            {inicial?.imagenUrl && (
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".8rem", color: "var(--muted)" }}>
                <input
                  type="checkbox"
                  name="quitarImagen"
                  checked={quitarImagen}
                  onChange={(e) => {
                    setQuitarImagen(e.target.checked);
                    if (e.target.checked) setPreview(null);
                    else setPreview(inicial.imagenUrl);
                  }}
                />
                Quitar foto actual
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" defaultValue={inicial?.nombre} required />
        </div>
        <div className="field">
          <label htmlFor="categoria">Categoría</label>
          <select id="categoria" name="categoria" defaultValue={inicial?.categoria ?? CATEGORIA_OPCIONES[0].codigo}>
            {CATEGORIA_OPCIONES.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {c.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="sku">SKU (opcional)</label>
          <input id="sku" name="sku" type="text" defaultValue={inicial?.sku ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="unidad">Unidad</label>
          <input id="unidad" name="unidad" type="text" defaultValue={inicial?.unidad ?? "unidad"} placeholder="unidad, metro, caja..." />
        </div>
      </div>
      <div className="field">
        <label htmlFor="tipo">Tipo de producto</label>
        <select id="tipo" name="tipo" defaultValue={inicial?.tipo ?? "SIMPLE"}>
          <option value="SIMPLE">Simple — se compra y se guarda tal cual</option>
          <option value="COMPUESTO">Compuesto — se arma con una receta (materiales + servicios + mano de obra)</option>
        </select>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="stockMinimo">Stock mínimo (alerta)</label>
          <input id="stockMinimo" name="stockMinimo" type="number" step="0.01" defaultValue={inicial?.stockMinimo ?? 0} />
        </div>
        <div className="field">
          <label htmlFor="costoUnitario">Costo unitario</label>
          <input
            id="costoUnitario"
            name="costoUnitario"
            type="number"
            step="0.01"
            value={costoUnitario}
            onChange={(e) => setCostoUnitario(e.target.value)}
          />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="margenPct">Margen de ganancia (%) — vacío usa el {margenDefaultPct}% por defecto</label>
          <input
            id="margenPct"
            name="margenPct"
            type="number"
            step="0.01"
            placeholder={String(margenDefaultPct)}
            value={margenPct}
            onChange={(e) => setMargenPct(e.target.value)}
          />
        </div>
        <div className="field">
          <label>PVP (precio de venta al público)</label>
          <div
            className="mono"
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              fontWeight: 600,
            }}
          >
            {pvp === null ? "— (sin costo unitario)" : fmt(pvp)}
          </div>
        </div>
      </div>
      <div className="field">
        <label htmlFor="proveedorId">Proveedor habitual</label>
        <select id="proveedorId" name="proveedorId" defaultValue={inicial?.proveedorId ?? ""}>
          <option value="">Sin proveedor asignado</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>
      {state.error && <p className="form-note error">{state.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar producto"}
      </button>
    </form>
  );
}
