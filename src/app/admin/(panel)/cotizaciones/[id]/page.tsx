import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { guardarCotizacion, eliminarCotizacion } from "../actions";
import { crearFacturaDesdeCotizacion } from "../../facturas/actions";
import { CotizacionForm } from "../cotizacion-form";
import { TrashIcon } from "@/components/admin-icons";
import { parseCronograma } from "@/lib/cronograma";

export const dynamic = "force-dynamic";

export default async function CotizacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cotizacion, clientes, facturaExistente] = await Promise.all([
    prisma.cotizacion.findUnique({ where: { id }, include: { lineas: { orderBy: { orden: "asc" } }, cliente: true } }),
    prisma.cliente.findMany({ orderBy: { razonSocial: "asc" } }),
    prisma.factura.findUnique({ where: { cotizacionId: id } }),
  ]);
  if (!cotizacion) notFound();

  const origenId = cotizacion.cotizacionOrigenId ?? cotizacion.id;
  const versiones = await prisma.cotizacion.findMany({
    where: { OR: [{ id: origenId }, { cotizacionOrigenId: origenId }] },
    orderBy: { version: "asc" },
    select: { id: true, version: true, estado: true, fecha: true },
  });
  const esUltimaVersion = versiones.length === 0 || versiones[versiones.length - 1].id === cotizacion.id;

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="mono">
          {cotizacion.numero}
          {cotizacion.version > 1 && <span style={{ color: "var(--muted)", fontWeight: 400 }}> · v{cotizacion.version}</span>}
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <a href={`/admin/cotizaciones/${cotizacion.id}/pdf`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            Descargar PDF
          </a>
          {facturaExistente ? (
            <Link href={`/admin/facturas/${facturaExistente.id}`} className="btn btn-ghost btn-sm">
              Ver factura {facturaExistente.numero}
            </Link>
          ) : (
            cotizacion.estado === "ACEPTADA" && (
              <form action={crearFacturaDesdeCotizacion.bind(null, cotizacion.id)}>
                <button type="submit" className="btn btn-primary btn-sm">
                  Generar factura
                </button>
              </form>
            )
          )}
          <form action={eliminarCotizacion.bind(null, cotizacion.id)}>
            <button type="submit" className="btn btn-ghost btn-sm">
              <TrashIcon /> Eliminar
            </button>
          </form>
        </div>
      </div>

      {versiones.length > 1 && (
        <div className="admin-card" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>Versiones de {cotizacion.numero}:</span>
          {versiones.map((v) => (
            <Link
              key={v.id}
              href={`/admin/cotizaciones/${v.id}`}
              className="btn btn-sm"
              style={{
                background: v.id === cotizacion.id ? "var(--accent)" : "var(--surface-2)",
                color: v.id === cotizacion.id ? "var(--accent-fg)" : "var(--fg)",
                border: "1px solid var(--border)",
              }}
            >
              v{v.version} — {v.estado}
            </Link>
          ))}
        </div>
      )}

      {!esUltimaVersion && (
        <p className="form-note" style={{ marginBottom: 14, color: "var(--muted)" }}>
          Esta es la versión v{cotizacion.version}, no la más reciente. Se muestra tal como se envió — para seguir
          cotizando, abre la última versión de la lista de arriba.
        </p>
      )}

      <CotizacionForm
        action={guardarCotizacion.bind(null, cotizacion.id)}
        clientes={clientes}
        esNuevaVersion={esUltimaVersion && cotizacion.estado !== "BORRADOR"}
        inicial={{
          clienteId: cotizacion.clienteId,
          fecha: cotizacion.fecha.toISOString(),
          validaHasta: cotizacion.validaHasta ? cotizacion.validaHasta.toISOString() : null,
          ivaPct: Number(cotizacion.ivaPct),
          margenAplicadoPct: cotizacion.margenAplicadoPct === null ? null : Number(cotizacion.margenAplicadoPct),
          estado: cotizacion.estado,
          proyecto: cotizacion.proyecto,
          ubicacion: cotizacion.ubicacion,
          resumenEjecutivo: cotizacion.resumenEjecutivo,
          tiempoEjecucion: cotizacion.tiempoEjecucion,
          validezOferta: cotizacion.validezOferta,
          criterioCalculo: cotizacion.criterioCalculo,
          notasTerminos: cotizacion.notasTerminos,
          cronograma: parseCronograma(cotizacion.cronogramaJson),
          notas: cotizacion.notas,
          lineas: cotizacion.lineas.map((l) => ({
            categoria: l.categoria ?? "",
            descripcion: l.descripcion,
            cantidad: String(Number(l.cantidad)),
            unidad: l.unidad,
            precioUnitario: String(Number(l.precioUnitario)),
          })),
        }}
      />
    </div>
  );
}
