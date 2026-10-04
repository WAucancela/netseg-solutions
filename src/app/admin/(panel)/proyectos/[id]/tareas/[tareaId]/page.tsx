import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { eliminarTarea } from "../../../actions";
import { ChecklistList } from "@/components/checklist-list";
import { ChecklistForm } from "@/components/checklist-form";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = {
  INSPECCION: "Inspección",
  INSTALACION: "Instalación",
  SOPORTE: "Soporte",
};

export default async function TareaDetailPage({
  params,
}: {
  params: Promise<{ id: string; tareaId: string }>;
}) {
  const { id: proyectoId, tareaId } = await params;
  const tarea = await prisma.tarea.findUnique({
    where: { id: tareaId },
    include: { checklist: { orderBy: { orden: "asc" } }, proyecto: { include: { cliente: true } } },
  });
  if (!tarea || tarea.proyectoId !== proyectoId) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{tarea.titulo}</h1>
        <form action={eliminarTarea.bind(null, tarea.id, proyectoId)}>
          <button type="submit" className="btn btn-ghost btn-sm">
            <TrashIcon /> Eliminar tarea
          </button>
        </form>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Proyecto</th>
              <td>{tarea.proyecto.nombre}</td>
            </tr>
            <tr>
              <th>Cliente</th>
              <td>{tarea.proyecto.cliente.razonSocial}</td>
            </tr>
            <tr>
              <th>Tipo</th>
              <td>{TIPO_LABEL[tarea.tipo] ?? tarea.tipo}</td>
            </tr>
            <tr>
              <th>Técnico asignado</th>
              <td>{tarea.tecnicoNombre ?? "—"}</td>
            </tr>
            <tr>
              <th>Descripción</th>
              <td>{tarea.descripcion ?? "—"}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>
                <span className={`badge-estado ${tarea.estado}`}>{tarea.estado}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="admin-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: "1rem", marginBottom: 4 }}>Checklist de calidad</h2>
        <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 14 }}>
          Semáforo de verificación — todo debe quedar en verde antes de cerrar la tarea.
        </p>
        <ChecklistList items={tarea.checklist} />
        <ChecklistForm tareaId={tarea.id} />
      </div>
    </div>
  );
}
