import { prisma } from "@/lib/prisma";
import { guardarCotizacion } from "../actions";
import { CotizacionForm } from "../cotizacion-form";

export const dynamic = "force-dynamic";

export default async function NuevaCotizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;
  const clientes = await prisma.cliente.findMany({ orderBy: { razonSocial: "asc" } });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Nueva cotización</h1>
      </div>
      <CotizacionForm action={guardarCotizacion.bind(null, null)} clientes={clientes} clientePreseleccionado={clienteId} />
    </div>
  );
}
