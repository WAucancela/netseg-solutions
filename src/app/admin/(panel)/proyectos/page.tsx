import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FolderIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const proyectos = await prisma.proyecto.findMany({
    orderBy: { createdAt: "desc" },
    include: { cliente: true, _count: { select: { tareas: true } } },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Proyectos</h1>
        <Link href="/admin/proyectos/nuevo" className="btn btn-primary btn-sm">
          Nuevo proyecto
        </Link>
      </div>
      <div className="admin-card">
        {proyectos.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <FolderIcon size={22} />
            </span>
            <p>No hay proyectos todavía. Se crean desde la ficha de un cliente o aquí mismo.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Cliente</th>
                <th>Tareas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/proyectos/${p.id}`}>{p.nombre}</Link>
                  </td>
                  <td>{p.cliente.razonSocial}</td>
                  <td>{p._count.tareas}</td>
                  <td>
                    <span className={`badge-estado ${p.estado}`}>{p.estado}</span>
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
