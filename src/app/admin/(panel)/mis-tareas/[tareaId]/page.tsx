import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ChecklistList } from "@/components/checklist-list";
import { ChecklistForm } from "@/components/checklist-form";
import { EstadoSelect } from "./estado-select";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = {
  INSPECCION: "Inspección",
  INSTALACION: "Instalación",
  SOPORTE: "Soporte",
};

export default async function MiTareaDetailPage({ params }: { params: Promise<{ tareaId: string }> }) {
  const { tareaId } = await params;
  const session = await getSession();
  if (!session) return null;

  const tarea = await prisma.tarea.findUnique({
    where: { id: tareaId },
    include: { checklist: { orderBy: { orden: "asc" } }, proyecto: { include: { cliente: true } } },
  });

  if (!tarea) notFound();
  if (session.rol === "TECNICO" && tarea.tecnicoId !== session.usuarioId) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{tarea.titulo}</h1>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Cliente</th>
              <td>{tarea.proyecto.cliente.razonSocial}</td>
            </tr>
            <tr>
              <th>Proyecto</th>
              <td>{tarea.proyecto.nombre}</td>
            </tr>
            <tr>
              <th>Tipo</th>
              <td>{TIPO_LABEL[tarea.tipo] ?? tarea.tipo}</td>
            </tr>
            <tr>
              <th>Descripción</th>
              <td>{tarea.descripcion ?? "—"}</td>
            </tr>
            <tr>
              <th>Dirección</th>
              <td>{tarea.proyecto.cliente.direccion ?? "—"}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>
                <EstadoSelect tareaId={tarea.id} proyectoId={tarea.proyectoId} estadoInicial={tarea.estado} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="admin-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: "1rem", marginBottom: 4 }}>Checklist de calidad</h2>
        <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 14 }}>
          Semáforo de verificación — deja todo en verde antes de cerrar la tarea.
        </p>
        <ChecklistList items={tarea.checklist} />
        <ChecklistForm tareaId={tarea.id} />
      </div>
    </div>
  );
}
