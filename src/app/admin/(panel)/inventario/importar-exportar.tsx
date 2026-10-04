"use client";

import { useActionState, useRef } from "react";
import { importarProductos, type ImportarFormState } from "./actions";

const initialState: ImportarFormState = { mensaje: "", errores: [] };

export function ImportarExportarProductos() {
  const [state, formAction, isPending] = useActionState(importarProductos, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="admin-card" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1rem", marginBottom: 4 }}>Carga masiva (formato CSV)</h2>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", maxWidth: 560 }}>
            Descarga el formato con tu inventario actual, edítalo en Excel/Sheets y vuelve a subirlo para crear o
            actualizar productos en bloque. Columnas: <span className="mono">sku, nombre, categoria, unidad, tipo,
            stockActual, stockMinimo, costoUnitario, proveedor</span>. Un producto se actualiza si su{" "}
            <strong>sku</strong> ya existe; si lo dejas vacío, se crea uno nuevo. El stock actual solo se usa al
            crear (para productos existentes ajusta el stock desde su ficha).
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- descarga un archivo CSV, no una página */}
        <a href="/admin/inventario/formato" className="btn btn-ghost btn-sm" style={{ whiteSpace: "nowrap" }}>
          Descargar formato
        </a>
      </div>

      <form
        ref={formRef}
        action={async (fd) => {
          await formAction(fd);
          formRef.current?.reset();
        }}
        style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}
      >
        <input type="file" name="archivo" accept=".csv,text/csv" required />
        <button className="btn btn-primary btn-sm" type="submit" disabled={isPending}>
          {isPending ? "Subiendo..." : "Subir formato"}
        </button>
      </form>

      {state.mensaje && <p className="form-note ok">{state.mensaje}</p>}
      {state.errores.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <p className="form-note error" style={{ marginBottom: 4 }}>
            {state.mensaje ? "Avisos:" : "No se importó nada:"}
          </p>
          <ul style={{ fontSize: ".8rem", color: "var(--muted)", paddingLeft: 18, margin: 0 }}>
            {state.errores.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
