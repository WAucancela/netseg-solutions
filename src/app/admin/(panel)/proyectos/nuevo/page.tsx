import { prisma } from "@/lib/prisma";
import { guardarProyecto } from "../actions";
import { ProyectoForm } from "../proyecto-form";

export const dynamic = "force-dynamic";

export default async function NuevoProyectoPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;
  const clientes = await prisma.cliente.findMany({ orderBy: { razonSocial: "asc" } });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Nuevo proyecto</h1>
      </div>
      <ProyectoForm action={guardarProyecto.bind(null, null)} clientes={clientes} clientePreseleccionado={clienteId} />
    </div>
  );
}
