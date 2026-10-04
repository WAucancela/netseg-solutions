import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ClipboardCheckIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = {
  INSPECCION: "Inspección",
  INSTALACION: "Instalación",
  SOPORTE: "Soporte",
};

export default async function MisTareasPage() {
  const session = await getSession();
  if (!session) return null;

  const tareas = await prisma.tarea.findMany({
    where: session.rol === "ADMIN" ? {} : { tecnicoId: session.usuarioId },
    orderBy: [{ estado: "asc" }, { fechaProgramada: "asc" }],
    include: { proyecto: { include: { cliente: true } }, _count: { select: { checklist: true } } },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Mis tareas</h1>
      </div>
      <div className="admin-card">
        {tareas.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <ClipboardCheckIcon size={22} />
            </span>
            <p>No tienes tareas asignadas todavía.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Checklist</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link href={`/admin/mis-tareas/${t.id}`}>{t.titulo}</Link>
                  </td>
                  <td>{t.proyecto.cliente.razonSocial}</td>
                  <td>{TIPO_LABEL[t.tipo] ?? t.tipo}</td>
                  <td>{t._count.checklist}</td>
                  <td>
                    <span className={`badge-estado ${t.estado}`}>{t.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
