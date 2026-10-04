import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS, CATEGORIA_OPCIONES } from "@/lib/taxonomia";
import { calcularPvp } from "@/lib/precios";
import { getMargenDefaultPct } from "@/lib/precios.server";
import { BoxesIcon } from "@/components/admin-icons";
import { ImportarExportarProductos } from "./importar-exportar";
import { MargenDefaultForm } from "./margen-default-form";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const POR_PAGINA = 50;
const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const categoria = sp.categoria ?? "";
  const pagina = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductoInventarioWhereInput = {
    ...(q
      ? {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categoria ? { categoria } : {}),
  };

  const [total, productos, margenDefaultPct] = await Promise.all([
    prisma.productoInventario.count({ where }),
    prisma.productoInventario.findMany({
      where,
      orderBy: { nombre: "asc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    getMargenDefaultPct(),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const hayFiltro = Boolean(q || categoria);

  function hrefPagina(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoria) params.set("categoria", categoria);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/inventario${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1>Inventario</h1>
        <Link href="/admin/inventario/nuevo" className="btn btn-primary btn-sm">
          Nuevo producto
        </Link>
      </div>

      <ImportarExportarProductos />

      <MargenDefaultForm margenDefaultPct={margenDefaultPct} />

      <form
        method="GET"
        className="admin-card"
        style={{ marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}
      >
        <div className="field" style={{ flex: "1 1 240px", marginBottom: 0 }}>
          <label htmlFor="q">Buscar</label>
          <input id="q" name="q" type="text" defaultValue={q} placeholder="Nombre o SKU..." />
        </div>
        <div className="field" style={{ flex: "0 1 240px", marginBottom: 0 }}>
          <label htmlFor="categoria">Categoría</label>
          <select id="categoria" name="categoria" defaultValue={categoria}>
            <option value="">Todas las categorías</option>
            {CATEGORIA_OPCIONES.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {c.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" type="submit">
          Buscar
        </button>
        {hayFiltro && (
          <Link href="/admin/inventario" className="btn btn-ghost btn-sm">
            Limpiar
          </Link>
        )}
      </form>

      <div className="admin-card">
        {productos.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <BoxesIcon size={22} />
            </span>
            <p>{hayFiltro ? "No se encontraron productos con ese filtro." : "No hay productos en inventario todavía."}</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Costo unitario</th>
                  <th>PVP</th>
                  <th>Stock actual</th>
                  <th>Stock mínimo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => {
                  const bajo = Number(p.stockActual) <= Number(p.stockMinimo);
                  const pvp = calcularPvp(
                    p.costoUnitario === null ? null : Number(p.costoUnitario),
                    p.margenPct === null ? null : Number(p.margenPct),
                    margenDefaultPct
                  );
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/admin/inventario/${p.id}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {p.imagenUrl ? (
                            <Image
                              src={p.imagenUrl}
                              alt=""
                              width={32}
                              height={32}
                              style={{ borderRadius: 6, objectFit: "cover", border: "1px solid var(--border)" }}
                            />
                          ) : (
                            <span
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                background: "var(--surface-2)",
                                border: "1px solid var(--border)",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          {p.nombre}
                        </Link>
                      </td>
                      <td>{CATEGORIAS[p.categoria as keyof typeof CATEGORIAS] ?? p.categoria}</td>
                      <td className="mono">{p.costoUnitario === null ? "—" : fmt(Number(p.costoUnitario))}</td>
                      <td className="mono">{pvp === null ? "—" : fmt(pvp)}</td>
                      <td className="mono">
                        {Number(p.stockActual)} {p.unidad}
                      </td>
                      <td className="mono">{Number(p.stockMinimo)}</td>
                      <td>
                        <span className={`badge-estado ${bajo ? "PERDIDO" : "ACTIVO"}`}>
                          {bajo ? "Stock bajo" : "OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid var(--border)",
              }}
            >
              <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>
                {total} producto{total === 1 ? "" : "s"}
                {totalPaginas > 1 ? ` — página ${pagina} de ${totalPaginas}` : ""}
              </span>
              {totalPaginas > 1 && (
                <div style={{ display: "flex", gap: 8 }}>
                  {pagina > 1 ? (
                    <Link href={hrefPagina(pagina - 1)} className="btn btn-ghost btn-sm">
                      Anterior
                    </Link>
                  ) : (
                    <button className="btn btn-ghost btn-sm" disabled>
                      Anterior
                    </button>
                  )}
                  {pagina < totalPaginas ? (
                    <Link href={hrefPagina(pagina + 1)} className="btn btn-ghost btn-sm">
                      Siguiente
                    </Link>
                  ) : (
                    <button className="btn btn-ghost btn-sm" disabled>
                      Siguiente
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
