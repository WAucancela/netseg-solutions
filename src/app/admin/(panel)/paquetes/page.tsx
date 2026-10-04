import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PackageIcon, PencilIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function PaquetesPage() {
  const paquetes = await prisma.paquete.findMany({ orderBy: { orden: "asc" } });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Paquetes</h1>
        <Link href="/admin/paquetes/nuevo" className="btn btn-primary btn-sm">
          Nuevo paquete
        </Link>
      </div>
      <div className="admin-card">
        {paquetes.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <PackageIcon size={22} />
            </span>
            <p>No hay paquetes cargados. Se muestran en la sección de Productos del sitio público.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio desde</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paquetes.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/paquetes/${p.id}`}>{p.nombre}</Link>
                  </td>
                  <td className="mono">
                    {p.precioDesde === null ? "Cotización personalizada" : `$${Number(p.precioDesde).toLocaleString("en-US")}`}
                  </td>
                  <td>
                    <span className={`badge-estado ${p.activo ? "ACTIVO" : "CANCELADO"}`}>
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/paquetes/${p.id}`} className="btn btn-ghost btn-sm">
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
