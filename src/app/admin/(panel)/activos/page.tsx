import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS } from "@/lib/taxonomia";
import { NetworkIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ActivosPage() {
  const activos = await prisma.activoCliente.findMany({
    orderBy: { createdAt: "desc" },
    include: { cliente: true },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Activos de red</h1>
        <Link href="/admin/activos/nuevo" className="btn btn-primary btn-sm">
          Nuevo activo
        </Link>
      </div>
      <div className="admin-card">
        {activos.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <NetworkIcon size={22} />
            </span>
            <p>Sin equipos registrados todavía. Se cargan por cliente: cámaras, switches, control de acceso, con su IP/MAC/VLAN.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cliente</th>
                <th>Categoría</th>
                <th>IP</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {activos.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/activos/${a.id}`}>{a.nombre}</Link>
                  </td>
                  <td>{a.cliente.razonSocial}</td>
                  <td>{CATEGORIAS[a.categoria as keyof typeof CATEGORIAS] ?? a.categoria}</td>
                  <td className="mono">{a.ip ?? "—"}</td>
                  <td>
                    <span className={`badge-estado ${a.estado}`}>{a.estado}</span>
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
