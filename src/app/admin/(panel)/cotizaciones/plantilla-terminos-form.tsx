"use client";

import { useActionState, useState } from "react";
import { guardarPlantillaTerminos, type PlantillaFormState } from "./actions";

const initialState: PlantillaFormState = { error: "" };

export type PlantillaInicial = {
  empresaNombre: string;
  empresaTagline: string;
  empresaContacto: string;
  empresaCiudad: string;
  garantiaTexto: string;
  formaPagoTexto: string;
  requisitosTexto: string;
  alcanceTexto: string;
};

export function PlantillaTerminosForm({ inicial }: { inicial: PlantillaInicial }) {
  const [state, formAction, isPending] = useActionState(guardarPlantillaTerminos, initialState);
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="admin-card" style={{ marginBottom: 16 }}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1rem", marginBottom: 4 }}>Marca y plantilla de términos (PDF)</h2>
          <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>
            Datos de la empresa y texto fijo de garantía / forma de pago / requisitos / alcance que aparece en todas
            las cotizaciones generadas en PDF.
          </p>
        </div>
        <span style={{ color: "var(--accent)", fontSize: ".82rem", whiteSpace: "nowrap", marginLeft: 12 }}>
          {abierto ? "Ocultar" : "Editar"}
        </span>
      </button>

      {abierto && (
        <form action={formAction} style={{ marginTop: 16 }}>
          <div className="row2">
            <div className="field">
              <label htmlFor="empresaNombre">Nombre de la empresa</label>
              <input id="empresaNombre" name="empresaNombre" type="text" defaultValue={inicial.empresaNombre} required />
            </div>
            <div className="field">
              <label htmlFor="empresaCiudad">Ciudad</label>
              <input id="empresaCiudad" name="empresaCiudad" type="text" defaultValue={inicial.empresaCiudad} />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label htmlFor="empresaTagline">Línea de servicios (bajo el nombre)</label>
              <input id="empresaTagline" name="empresaTagline" type="text" defaultValue={inicial.empresaTagline} />
            </div>
            <div className="field">
              <label htmlFor="empresaContacto">Contacto (correo/teléfono)</label>
              <input id="empresaContacto" name="empresaContacto" type="text" defaultValue={inicial.empresaContacto} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="garantiaTexto">Garantía</label>
            <textarea id="garantiaTexto" name="garantiaTexto" defaultValue={inicial.garantiaTexto} rows={2} />
          </div>
          <div className="field">
            <label htmlFor="formaPagoTexto">Forma de pago</label>
            <textarea id="formaPagoTexto" name="formaPagoTexto" defaultValue={inicial.formaPagoTexto} rows={2} />
          </div>
          <div className="field">
            <label htmlFor="requisitosTexto">Requerimientos previos del cliente (una línea por punto)</label>
            <textarea id="requisitosTexto" name="requisitosTexto" defaultValue={inicial.requisitosTexto} rows={3} />
          </div>
          <div className="field">
            <label htmlFor="alcanceTexto">Alcance</label>
            <textarea id="alcanceTexto" name="alcanceTexto" defaultValue={inicial.alcanceTexto} rows={2} />
          </div>

          {state.error && <p className="form-note error">{state.error}</p>}

          <button className="btn btn-primary btn-sm" type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar plantilla"}
          </button>
        </form>
      )}
    </div>
  );
}
