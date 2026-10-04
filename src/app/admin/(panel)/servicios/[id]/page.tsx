import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardarServicio, eliminarServicio } from "../actions";
import { ServicioForm } from "../servicio-form";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const servicio = await prisma.servicio.findUnique({
    where: { id },
    include: { items: { orderBy: { orden: "asc" } } },
  });
  if (!servicio) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{servicio.nombre}</h1>
        <form action={eliminarServicio.bind(null, servicio.id)}>
          <button type="submit" className="btn btn-ghost btn-sm">
            <TrashIcon /> Eliminar
          </button>
        </form>
      </div>
      <ServicioForm
        action={guardarServicio.bind(null, servicio.id)}
        inicial={{
          nombre: servicio.nombre,
          categoria: servicio.categoria,
          descripcion: servicio.descripcion,
          destacado: servicio.destacado,
          activo: servicio.activo,
          orden: servicio.orden,
          items: servicio.items.map((i) => i.texto),
        }}
      />
    </div>
  );
}
