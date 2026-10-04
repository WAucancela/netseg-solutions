import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UserPlusIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ProspectosPage() {
  const prospectos = await prisma.prospecto.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Prospectos</h1>
      </div>
      <div className="admin-card">
        {prospectos.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <UserPlusIcon size={22} />
            </span>
            <p>No hay prospectos todavía. Aparecerán aquí cuando alguien use el formulario de contacto del sitio.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Servicio de interés</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {prospectos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/prospectos/${p.id}`}>{p.nombre}</Link>
                  </td>
                  <td>{p.empresa ?? "—"}</td>
                  <td>{p.servicioInteres ?? "—"}</td>
                  <td>
                    <span className={`badge-estado ${p.estado}`}>{p.estado}</span>
                  </td>
                  <td>{p.createdAt.toLocaleDateString("es-EC")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
