import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecetaForm } from "./receta-form";
import { ProducirForm } from "./producir-form";

export const dynamic = "force-dynamic";

export default async function RecetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [producto, serviciosDisponibles, receta] = await Promise.all([
    prisma.productoInventario.findUnique({ where: { id } }),
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    prisma.receta.findUnique({
      where: { productoId: id },
      include: {
        materiales: {
          orderBy: { orden: "asc" },
          include: { producto: { select: { nombre: true, sku: true, unidad: true, costoUnitario: true } } },
        },
        servicios: { orderBy: { orden: "asc" } },
      },
    }),
  ]);
  if (!producto) notFound();
  if (producto.tipo !== "COMPUESTO") notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>Receta — {producto.nombre}</h1>
      </div>

      <RecetaForm
        productoId={producto.id}
        serviciosDisponibles={serviciosDisponibles}
        inicial={
          receta
            ? {
                manoObraHoras: receta.manoObraHoras === null ? null : Number(receta.manoObraHoras),
                manoObraTarifaHora: receta.manoObraTarifaHora === null ? null : Number(receta.manoObraTarifaHora),
                notas: receta.notas,
                materiales: receta.materiales.map((m) => ({
                  productoId: m.productoId,
                  nombre: m.producto.nombre,
                  sku: m.producto.sku,
                  unidad: m.producto.unidad,
                  costoUnitario: m.producto.costoUnitario === null ? null : Number(m.producto.costoUnitario),
                  cantidad: String(Number(m.cantidad)),
                })),
                servicios: receta.servicios.map((s) => ({
                  servicioId: s.servicioId ?? "",
                  descripcion: s.descripcion,
                  costo: String(Number(s.costo)),
                })),
              }
            : undefined
        }
      />

      {receta && <ProducirForm productoId={producto.id} />}
    </div>
  );
}
