import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { eliminarFactura, anularFactura } from "../actions";
import { GenerarButton } from "./generar-button";
import { TrashIcon } from "@/components/admin-icons";
import { getEmisorConfig } from "@/lib/sri";

export const dynamic = "force-dynamic";

export default async function FacturaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const factura = await prisma.factura.findUnique({
    where: { id },
    include: { cliente: true, lineas: { orderBy: { orden: "asc" } } },
  });
  if (!factura) notFound();

  const subtotal = factura.lineas.reduce((acc, l) => acc + Number(l.cantidad) * Number(l.precioUnitario), 0);
  const iva = subtotal * (Number(factura.ivaPct) / 100);
  const total = subtotal + iva;
  const emisorConfigurado = getEmisorConfig() !== null;

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="mono">{factura.numero}</h1>
        <div style={{ display: "flex", gap: 10 }}>
          {factura.estado !== "ANULADA" && (
            <form action={anularFactura.bind(null, factura.id)}>
              <button type="submit" className="btn btn-ghost btn-sm">
                Anular
              </button>
            </form>
          )}
          {factura.estado === "BORRADOR" && (
            <form action={eliminarFactura.bind(null, factura.id)}>
              <button type="submit" className="btn btn-ghost btn-sm">
                <TrashIcon /> Eliminar
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <tbody>
            <tr>
              <th>Cliente</th>
              <td>
                {factura.cliente.razonSocial} · {factura.cliente.ruc}
              </td>
            </tr>
            <tr>
              <th>Fecha</th>
              <td>{factura.fecha.toLocaleDateString("es-EC")}</td>
            </tr>
            <tr>
              <th>Estado</th>
              <td>
                <span className={`badge-estado ${factura.estado}`}>{factura.estado}</span>
              </td>
            </tr>
            <tr>
              <th>Clave de acceso</th>
              <td className="mono" style={{ wordBreak: "break-all" }}>
                {factura.claveAcceso ?? "— (sin generar)"}
              </td>
            </tr>
            <tr>
              <th>Subtotal</th>
              <td className="mono">${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <th>IVA ({Number(factura.ivaPct)}%)</th>
              <td className="mono">${iva.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Total</th>
              <td className="mono">${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="admin-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Líneas</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio unit.</th>
            </tr>
          </thead>
          <tbody>
            {factura.lineas.map((l) => (
              <tr key={l.id}>
                <td>{l.descripcion}</td>
                <td className="mono">{Number(l.cantidad)}</td>
                <td className="mono">${Number(l.precioUnitario).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {factura.estado === "BORRADOR" && (
        <div className="admin-card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: "1rem", marginBottom: 8 }}>Generar comprobante</h2>
          {!emisorConfigurado && (
            <p className="form-note error" style={{ marginBottom: 10 }}>
              Falta configurar NETSEG_RUC (y los demás datos del emisor) en las variables de entorno.
            </p>
          )}
          <GenerarButton facturaId={factura.id} />
        </div>
      )}

      {factura.xml && (
        <div className="admin-card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: "1rem", marginBottom: 4 }}>XML generado</h2>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 12 }}>
            Sin firmar ni enviado al SRI todavía — ver README para completar ese paso con tu certificado digital.
          </p>
          <pre
            className="mono"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 14,
              fontSize: ".76rem",
              overflowX: "auto",
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            {factura.xml}
          </pre>
        </div>
      )}
    </div>
  );
}
