import { prisma } from "@/lib/prisma";
import { guardarActivo } from "../actions";
import { ActivoForm } from "../activo-form";

export const dynamic = "force-dynamic";

export default async function NuevoActivoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;
  const [clientes, proyectos] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { razonSocial: "asc" } }),
    prisma.proyecto.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true, clienteId: true } }),
  ]);

  return (
    <div>
      <div className="admin-page-head">
        <h1>Nuevo activo</h1>
      </div>
      <ActivoForm
        action={guardarActivo.bind(null, null)}
        clientes={clientes}
        proyectos={proyectos}
        clientePreseleccionado={clienteId}
      />
    </div>
  );
}
