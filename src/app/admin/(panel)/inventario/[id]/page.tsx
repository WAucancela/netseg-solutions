import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calcularPvp } from "@/lib/precios";
import { getMargenDefaultPct } from "@/lib/precios.server";
import { guardarProducto, eliminarProducto } from "../actions";
import { ProductoForm } from "../producto-form";
import { AjusteForm } from "../ajuste-form";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = { ENTRADA: "Entrada", SALIDA: "Salida", AJUSTE: "Ajuste" };
const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function ProductoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [producto, proveedores, movimientos, margenDefaultPct] = await Promise.all([
    prisma.productoInventario.findUnique({ where: { id } }),
    prisma.proveedor.findMany({ orderBy: { nombre: "asc" } }),
    prisma.movimientoInventario.findMany({ where: { productoId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    getMargenDefaultPct(),
  ]);
  if (!producto) notFound();

  const pvp = calcularPvp(
    producto.costoUnitario === null ? null : Number(producto.costoUnitario),
    producto.margenPct === null ? null : Number(producto.margenPct),
    margenDefaultPct
  );

  return (
    <div>
      <div className="admin-page-head">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {producto.imagenUrl && (
            <Image
              src={producto.imagenUrl}
              alt={producto.nombre}
              width={48}
              height={48}
              style={{ borderRadius: 8, objectFit: "cover", border: "1px solid var(--border)" }}
            />
          )}
          <h1>{producto.nombre}</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {producto.tipo === "COMPUESTO" && (
            <Link href={`/admin/inventario/${producto.id}/receta`} className="btn btn-primary btn-sm">
              Gestionar receta (BOM)
            </Link>
          )}
          <form action={eliminarProducto.bind(null, producto.id)}>
            <button type="submit" className="btn btn-ghost btn-sm">
              <TrashIcon /> Eliminar
            </button>
          </form>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-tile">
          <span>
            <span className="num mono">
              {Number(producto.stockActual)} <small style={{ fontSize: ".7em" }}>{producto.unidad}</small>
            </span>
            <span className="lbl" style={{ display: "block" }}>
              Stock actual
            </span>
          </span>
        </div>
        <div className="stat-tile">
          <span>
            <span className="num mono">{pvp === null ? "—" : fmt(pvp)}</span>
            <span className="lbl" style={{ display: "block" }}>
              PVP {producto.margenPct === null ? `(margen ${margenDefaultPct}% por defecto)` : `(margen ${Number(producto.margenPct)}%)`}
            </span>
          </span>
        </div>
      </div>

      <ProductoForm
        action={guardarProducto.bind(null, producto.id)}
        proveedores={proveedores}
        margenDefaultPct={margenDefaultPct}
        inicial={{
          nombre: producto.nombre,
          categoria: producto.categoria,
          sku: producto.sku,
          unidad: producto.unidad,
          tipo: producto.tipo,
          stockMinimo: Number(producto.stockMinimo),
          costoUnitario: producto.costoUnitario === null ? null : Number(producto.costoUnitario),
          margenPct: producto.margenPct === null ? null : Number(producto.margenPct),
          proveedorId: producto.proveedorId,
          imagenUrl: producto.imagenUrl,
        }}
      />

      <AjusteForm productoId={producto.id} />

      <div className="admin-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Movimientos recientes</h2>
        {movimientos.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: ".86rem" }}>Sin movimientos todavía.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th>Referencia</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td>{TIPO_LABEL[m.tipo] ?? m.tipo}</td>
                  <td className="mono">{Number(m.cantidad)}</td>
                  <td>{m.motivo ?? "—"}</td>
                  <td>{m.referencia ?? "—"}</td>
                  <td>{m.createdAt.toLocaleDateString("es-EC")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
