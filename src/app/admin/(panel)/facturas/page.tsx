import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InvoiceIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function FacturasPage() {
  const facturas = await prisma.factura.findMany({
    orderBy: { createdAt: "desc" },
    include: { cliente: true, lineas: true },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Facturas</h1>
        <Link href="/admin/facturas/nuevo" className="btn btn-primary btn-sm">
          Nueva factura
        </Link>
      </div>
      <div className="admin-card">
        {facturas.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <InvoiceIcon size={22} />
            </span>
            <p>No hay facturas todavía. También puedes generar una desde una cotización aceptada.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => {
                const subtotal = f.lineas.reduce((acc, l) => acc + Number(l.cantidad) * Number(l.precioUnitario), 0);
                const total = subtotal * (1 + Number(f.ivaPct) / 100);
                return (
                  <tr key={f.id}>
                    <td className="mono">
                      <Link href={`/admin/facturas/${f.id}`}>{f.numero}</Link>
                    </td>
                    <td>{f.cliente.razonSocial}</td>
                    <td className="mono">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge-estado ${f.estado}`}>{f.estado}</span>
                    </td>
                    <td>{f.fecha.toLocaleDateString("es-EC")}</td>
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
