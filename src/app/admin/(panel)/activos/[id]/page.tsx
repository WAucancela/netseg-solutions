import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardarActivo, eliminarActivo } from "../actions";
import { ActivoForm } from "../activo-form";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ActivoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [activo, clientes, proyectos] = await Promise.all([
    prisma.activoCliente.findUnique({ where: { id } }),
    prisma.cliente.findMany({ orderBy: { razonSocial: "asc" } }),
    prisma.proyecto.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true, clienteId: true } }),
  ]);
  if (!activo) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{activo.nombre}</h1>
        <form action={eliminarActivo.bind(null, activo.id)}>
          <button type="submit" className="btn btn-ghost btn-sm">
            <TrashIcon /> Eliminar
          </button>
        </form>
      </div>
      <ActivoForm
        action={guardarActivo.bind(null, activo.id)}
        clientes={clientes}
        proyectos={proyectos}
        inicial={{
          clienteId: activo.clienteId,
          proyectoId: activo.proyectoId,
          categoria: activo.categoria,
          nombre: activo.nombre,
          marca: activo.marca,
          modelo: activo.modelo,
          serial: activo.serial,
          ip: activo.ip,
          mac: activo.mac,
          vlan: activo.vlan,
          puertoSwitch: activo.puertoSwitch,
          ubicacion: activo.ubicacion,
          estado: activo.estado,
          fechaInstalacion: activo.fechaInstalacion ? activo.fechaInstalacion.toISOString() : null,
          notas: activo.notas,
        }}
      />
    </div>
  );
}
