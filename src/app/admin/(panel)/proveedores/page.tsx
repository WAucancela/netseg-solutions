import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BuildingIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
  const proveedores = await prisma.proveedor.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true, ordenes: true } } },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Proveedores</h1>
        <Link href="/admin/proveedores/nuevo" className="btn btn-primary btn-sm">
          Nuevo proveedor
        </Link>
      </div>
      <div className="admin-card">
        {proveedores.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <BuildingIcon size={22} />
            </span>
            <p>No hay proveedores registrados todavía.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Productos</th>
                <th>Órdenes</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/proveedores/${p.id}`}>{p.nombre}</Link>
                  </td>
                  <td>{p.contacto ?? "—"}</td>
                  <td>{p.telefono ?? "—"}</td>
                  <td>{p._count.productos}</td>
                  <td>{p._count.ordenes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
