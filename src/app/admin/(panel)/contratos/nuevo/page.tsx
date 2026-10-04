import { prisma } from "@/lib/prisma";
import { guardarContrato } from "../actions";
import { ContratoForm } from "../contrato-form";

export const dynamic = "force-dynamic";

export default async function NuevoContratoPage() {
  const paquetes = await prisma.paquete.findMany({ where: { activo: true }, orderBy: { orden: "asc" } });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Nuevo contrato</h1>
      </div>
      <ContratoForm action={guardarContrato.bind(null, null)} paquetes={paquetes} />
    </div>
  );
}
