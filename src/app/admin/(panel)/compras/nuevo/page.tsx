import { prisma } from "@/lib/prisma";
import { guardarCompra } from "../actions";
import { CompraForm } from "../compra-form";

export const dynamic = "force-dynamic";

export default async function NuevaCompraPage() {
  const [proveedores, productos] = await Promise.all([
    prisma.proveedor.findMany({ orderBy: { nombre: "asc" } }),
    prisma.productoInventario.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  if (productos.length === 0) {
    return (
      <div>
        <div className="admin-page-head">
          <h1>Nueva orden de compra</h1>
        </div>
        <div className="admin-card">
          <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
            Primero necesitas al menos un producto en Inventario y un proveedor para poder armar una orden de compra.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1>Nueva orden de compra</h1>
      </div>
      <CompraForm action={guardarCompra.bind(null, null)} proveedores={proveedores} productos={productos} />
    </div>
  );
}
