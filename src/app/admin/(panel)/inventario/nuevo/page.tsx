import { prisma } from "@/lib/prisma";
import { getMargenDefaultPct } from "@/lib/precios.server";
import { guardarProducto } from "../actions";
import { ProductoForm } from "../producto-form";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const [proveedores, margenDefaultPct] = await Promise.all([
    prisma.proveedor.findMany({ orderBy: { nombre: "asc" } }),
    getMargenDefaultPct(),
  ]);

  return (
    <div>
      <div className="admin-page-head">
        <h1>Nuevo producto</h1>
      </div>
      <ProductoForm action={guardarProducto.bind(null, null)} proveedores={proveedores} margenDefaultPct={margenDefaultPct} />
    </div>
  );
}
