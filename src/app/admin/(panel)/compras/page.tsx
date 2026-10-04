import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TruckIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const ordenes = await prisma.ordenCompra.findMany({
    orderBy: { createdAt: "desc" },
    include: { proveedor: true, lineas: true },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Órdenes de compra</h1>
        <Link href="/admin/compras/nuevo" className="btn btn-primary btn-sm">
          Nueva orden
        </Link>
      </div>
      <div className="admin-card">
        {ordenes.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <TruckIcon size={22} />
            </span>
            <p>No hay órdenes de compra todavía.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Proveedor</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const total = o.lineas.reduce((acc, l) => acc + Number(l.cantidad) * Number(l.costoUnitario), 0);
                return (
                  <tr key={o.id}>
                    <td className="mono">
                      <Link href={`/admin/compras/${o.id}`}>{o.numero}</Link>
                    </td>
                    <td>{o.proveedor.nombre}</td>
                    <td className="mono">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge-estado ${o.estado}`}>{o.estado}</span>
                    </td>
                    <td>{o.fecha.toLocaleDateString("es-EC")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
