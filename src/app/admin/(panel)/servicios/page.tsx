import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS } from "@/lib/taxonomia";
import { ListIcon, PencilIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ServiciosPage() {
  const servicios = await prisma.servicio.findMany({ orderBy: [{ destacado: "desc" }, { orden: "asc" }] });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Servicios</h1>
        <Link href="/admin/servicios/nuevo" className="btn btn-primary btn-sm">
          Nuevo servicio
        </Link>
      </div>
      <div className="admin-card">
        {servicios.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <ListIcon size={22} />
            </span>
            <p>No hay servicios cargados. Se muestran en la sección de Servicios del sitio público.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Sección</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/admin/servicios/${s.id}`}>{s.nombre}</Link>
                  </td>
                  <td>{CATEGORIAS[s.categoria as keyof typeof CATEGORIAS] ?? s.categoria}</td>
                  <td>{s.destacado ? "Principal" : "También trabajamos con"}</td>
                  <td>
                    <span className={`badge-estado ${s.activo ? "ACTIVO" : "CANCELADO"}`}>
                      {s.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/servicios/${s.id}`} className="btn btn-ghost btn-sm">
                      <PencilIcon /> Editar
                    </Link>
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
