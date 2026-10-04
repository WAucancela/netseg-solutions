import { prisma } from "@/lib/prisma";
import { FacturaForm } from "../factura-form";

export const dynamic = "force-dynamic";

export default async function NuevaFacturaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;
  const clientes = await prisma.cliente.findMany({ orderBy: { razonSocial: "asc" } });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Nueva factura</h1>
      </div>
      <FacturaForm clientes={clientes} clientePreseleccionado={clienteId} />
    </div>
  );
}
