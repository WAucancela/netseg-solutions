import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReceiptIcon } from "@/components/admin-icons";
import { PlantillaTerminosForm } from "./plantilla-terminos-form";

export const dynamic = "force-dynamic";

export default async function CotizacionesPage() {
  const [cotizaciones, configuracion] = await Promise.all([
    prisma.cotizacion.findMany({
      orderBy: { createdAt: "desc" },
      include: { cliente: true, lineas: true },
    }),
    prisma.configuracion.findUnique({ where: { id: "global" } }),
  ]);

  return (
    <div>
      <div className="admin-page-head">
        <h1>Cotizaciones</h1>
        <Link href="/admin/cotizaciones/nuevo" className="btn btn-primary btn-sm">
          Nueva cotización
        </Link>
      </div>

      <PlantillaTerminosForm
        inicial={{
          empresaNombre: configuracion?.empresaNombre ?? "NETSEG SOLUTIONS",
          empresaTagline: configuracion?.empresaTagline ?? "Seguridad electrónica · Infraestructura de redes · Domótica",
          empresaContacto: configuracion?.empresaContacto ?? "info@netsegsolutions.ec",
          empresaCiudad: configuracion?.empresaCiudad ?? "Guayaquil, Ecuador",
          garantiaTexto: configuracion?.garantiaTexto ?? "",
          formaPagoTexto: configuracion?.formaPagoTexto ?? "",
          requisitosTexto: configuracion?.requisitosTexto ?? "",
          alcanceTexto: configuracion?.alcanceTexto ?? "",
        }}
      />

      <div className="admin-card">
        {cotizaciones.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <ReceiptIcon size={22} />
            </span>
            <p>No hay cotizaciones todavía. Se crean desde la ficha de un cliente o aquí mismo.</p>
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
              {cotizaciones.map((c) => {
                const subtotal = c.lineas.reduce((acc, l) => acc + Number(l.cantidad) * Number(l.precioUnitario), 0);
                const total = subtotal * (1 + Number(c.ivaPct) / 100);
                return (
                  <tr key={c.id}>
                    <td className="mono">
                      <Link href={`/admin/cotizaciones/${c.id}`}>
                        {c.numero}
                        {c.version > 1 && <span style={{ color: "var(--muted)" }}> · v{c.version}</span>}
                      </Link>
                    </td>
                    <td>{c.cliente.razonSocial}</td>
                    <td className="mono">${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge-estado ${c.estado}`}>{c.estado}</span>
                    </td>
                    <td>{c.fecha.toLocaleDateString("es-EC")}</td>
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
