import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardarProyecto, eliminarProyecto } from "../actions";
import { ProyectoForm } from "../proyecto-form";
import { TareaForm } from "./tarea-form";
import { TareaList } from "./tarea-list";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ProyectoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [proyecto, clientes, tecnicos] = await Promise.all([
    prisma.proyecto.findUnique({
      where: { id },
      include: { tareas: { orderBy: { createdAt: "asc" }, include: { _count: { select: { checklist: true } } } } },
    }),
    prisma.cliente.findMany({ orderBy: { razonSocial: "asc" } }),
    prisma.usuario.findMany({ where: { rol: "TECNICO", activo: true }, orderBy: { nombre: "asc" } }),
  ]);
  if (!proyecto) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{proyecto.nombre}</h1>
        <form action={eliminarProyecto.bind(null, proyecto.id)}>
          <button type="submit" className="btn btn-ghost btn-sm">
            <TrashIcon /> Eliminar
          </button>
        </form>
      </div>

      <ProyectoForm
        action={guardarProyecto.bind(null, proyecto.id)}
        clientes={clientes}
        inicial={{
          clienteId: proyecto.clienteId,
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          estado: proyecto.estado,
          presupuestoAprobado: proyecto.presupuestoAprobado === null ? null : Number(proyecto.presupuestoAprobado),
          margenMetaPct: proyecto.margenMetaPct === null ? null : Number(proyecto.margenMetaPct),
          fechaInicio: proyecto.fechaInicio ? proyecto.fechaInicio.toISOString() : null,
          fechaFin: proyecto.fechaFin ? proyecto.fechaFin.toISOString() : null,
        }}
      />

      <div className="admin-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Tareas</h2>
        <TareaList proyectoId={proyecto.id} tareas={proyecto.tareas} />
      </div>

      <TareaForm proyectoId={proyecto.id} tecnicos={tecnicos} />
    </div>
  );
}
