"use client";

import { useActionState } from "react";
import { CATEGORIA_OPCIONES } from "@/lib/taxonomia";
import type { ActivoFormState } from "./actions";

const initialState: ActivoFormState = { error: "" };

type ActivoInicial = {
  clienteId: string;
  proyectoId: string | null;
  categoria: string;
  nombre: string;
  marca: string | null;
  modelo: string | null;
  serial: string | null;
  ip: string | null;
  mac: string | null;
  vlan: string | null;
  puertoSwitch: string | null;
  ubicacion: string | null;
  estado: string;
  fechaInstalacion: string | null;
  notas: string | null;
};

export function ActivoForm({
  action,
  clientes,
  proyectos,
  clientePreseleccionado,
  inicial,
}: {
  action: (prevState: ActivoFormState, formData: FormData) => Promise<ActivoFormState>;
  clientes: { id: string; razonSocial: string }[];
  proyectos: { id: string; nombre: string; clienteId: string }[];
  clientePreseleccionado?: string;
  inicial?: ActivoInicial;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="admin-card">
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
          <label htmlFor="proyectoId">Proyecto (opcional)</label>
          <select id="proyectoId" name="proyectoId" defaultValue={inicial?.proyectoId ?? ""}>
            <option value="">Sin proyecto asociado</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row2">
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
        <div className="field">
          <label htmlFor="nombre">Nombre / descripción</label>
          <input id="nombre" name="nombre" type="text" defaultValue={inicial?.nombre} placeholder="Cámara entrada principal" required />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="marca">Marca</label>
          <input id="marca" name="marca" type="text" defaultValue={inicial?.marca ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="modelo">Modelo</label>
          <input id="modelo" name="modelo" type="text" defaultValue={inicial?.modelo ?? ""} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="serial">Serial</label>
        <input id="serial" name="serial" type="text" defaultValue={inicial?.serial ?? ""} />
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="ip">IP</label>
          <input id="ip" name="ip" type="text" className="mono" defaultValue={inicial?.ip ?? ""} placeholder="192.168.1.10" />
        </div>
        <div className="field">
          <label htmlFor="mac">MAC</label>
          <input id="mac" name="mac" type="text" className="mono" defaultValue={inicial?.mac ?? ""} placeholder="AA:BB:CC:DD:EE:FF" />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="vlan">VLAN</label>
          <input id="vlan" name="vlan" type="text" defaultValue={inicial?.vlan ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="puertoSwitch">Puerto de switch</label>
          <input id="puertoSwitch" name="puertoSwitch" type="text" defaultValue={inicial?.puertoSwitch ?? ""} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="ubicacion">Ubicación física</label>
        <input id="ubicacion" name="ubicacion" type="text" defaultValue={inicial?.ubicacion ?? ""} placeholder="Rack principal, 2do piso" />
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" defaultValue={inicial?.estado ?? "ACTIVO"}>
            <option value="ACTIVO">Activo</option>
            <option value="EN_MANTENIMIENTO">En mantenimiento</option>
            <option value="DADO_DE_BAJA">Dado de baja</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="fechaInstalacion">Fecha de instalación</label>
          <input
            id="fechaInstalacion"
            name="fechaInstalacion"
            type="date"
            defaultValue={inicial?.fechaInstalacion ? inicial.fechaInstalacion.slice(0, 10) : ""}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="notas">Notas</label>
        <textarea id="notas" name="notas" defaultValue={inicial?.notas ?? ""} rows={2} />
      </div>

      {state.error && <p className="form-note error">{state.error}</p>}

      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar activo"}
      </button>
    </form>
  );
}
