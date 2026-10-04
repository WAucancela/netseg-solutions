import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BuildingIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { proyectos: true, activos: true, cotizaciones: true } } },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Clientes</h1>
        <Link href="/admin/clientes/nuevo" className="btn btn-primary btn-sm">
          Nuevo cliente
        </Link>
      </div>
      <div className="admin-card">
        {clientes.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <BuildingIcon size={22} />
            </span>
            <p>Todavía no hay clientes. Se crean a mano o convirtiendo un prospecto desde su detalle.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Razón social</th>
                <th>RUC</th>
                <th>Proyectos</th>
                <th>Activos</th>
                <th>Cotizaciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/clientes/${c.id}`}>{c.razonSocial}</Link>
                  </td>
                  <td className="mono">{c.ruc}</td>
                  <td>{c._count.proyectos}</td>
                  <td>{c._count.activos}</td>
                  <td>{c._count.cotizaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
