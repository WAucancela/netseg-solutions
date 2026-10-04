import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardarPaquete, eliminarPaquete } from "../actions";
import { PaqueteForm } from "../paquete-form";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function EditarPaquetePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paquete = await prisma.paquete.findUnique({
    where: { id },
    include: { items: { orderBy: { orden: "asc" } } },
  });
  if (!paquete) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{paquete.nombre}</h1>
        <form action={eliminarPaquete.bind(null, paquete.id)}>
          <button type="submit" className="btn btn-ghost btn-sm">
            <TrashIcon /> Eliminar
          </button>
        </form>
      </div>
      <PaqueteForm
        action={guardarPaquete.bind(null, paquete.id)}
        inicial={{
          nombre: paquete.nombre,
          descripcionAlcance: paquete.descripcionAlcance,
          precioDesde: paquete.precioDesde === null ? null : Number(paquete.precioDesde),
          notaPrecio: paquete.notaPrecio,
          destacado: paquete.destacado,
          premium: paquete.premium,
          activo: paquete.activo,
          orden: paquete.orden,
          items: paquete.items.map((i) => i.texto),
        }}
      />
    </div>
  );
}
