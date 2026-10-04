import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardarCompra, eliminarCompra, marcarRecibida } from "../actions";
import { CompraForm } from "../compra-form";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function CompraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [orden, proveedores, productos] = await Promise.all([
    prisma.ordenCompra.findUnique({ where: { id }, include: { lineas: { orderBy: { orden: "asc" } } } }),
    prisma.proveedor.findMany({ orderBy: { nombre: "asc" } }),
    prisma.productoInventario.findMany({ orderBy: { nombre: "asc" } }),
  ]);
  if (!orden) notFound();

  const recibida = orden.estado === "RECIBIDA";

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="mono">{orden.numero}</h1>
        <div style={{ display: "flex", gap: 10 }}>
          {!recibida && orden.estado !== "CANCELADA" && (
            <form action={marcarRecibida.bind(null, orden.id)}>
              <button type="submit" className="btn btn-primary btn-sm">
                Marcar como recibida
              </button>
            </form>
          )}
          {!recibida && (
            <form action={eliminarCompra.bind(null, orden.id)}>
              <button type="submit" className="btn btn-ghost btn-sm">
                <TrashIcon /> Eliminar
              </button>
            </form>
          )}
        </div>
      </div>

      {recibida && (
        <div className="secaas-banner" style={{ marginBottom: 16, marginTop: 0 }}>
          <p>
            <strong>Esta orden ya fue recibida.</strong> El stock de cada producto ya se actualizó y la orden quedó
            de solo lectura.
          </p>
        </div>
      )}

      <CompraForm
        action={guardarCompra.bind(null, orden.id)}
        proveedores={proveedores}
        productos={productos}
        soloLectura={recibida}
        inicial={{
          proveedorId: orden.proveedorId,
          fecha: orden.fecha.toISOString(),
          estado: orden.estado,
          notas: orden.notas,
          lineas: orden.lineas.map((l) => ({
            productoId: l.productoId,
            cantidad: String(Number(l.cantidad)),
            costoUnitario: String(Number(l.costoUnitario)),
          })),
        }}
      />
    </div>
  );
}
