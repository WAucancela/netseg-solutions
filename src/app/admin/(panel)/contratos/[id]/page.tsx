import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardarContrato, eliminarContrato } from "../actions";
import { ContratoForm } from "../contrato-form";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function EditarContratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [contrato, paquetes] = await Promise.all([
    prisma.contrato.findUnique({ where: { id } }),
    prisma.paquete.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }),
  ]);
  if (!contrato) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{contrato.clienteNombre}</h1>
        <form action={eliminarContrato.bind(null, contrato.id)}>
          <button type="submit" className="btn btn-ghost btn-sm">
            <TrashIcon /> Eliminar
          </button>
        </form>
      </div>
      <ContratoForm
        action={guardarContrato.bind(null, contrato.id)}
        paquetes={paquetes}
        inicial={{
          clienteNombre: contrato.clienteNombre,
          clienteEmail: contrato.clienteEmail,
          clienteTelefono: contrato.clienteTelefono,
          paqueteId: contrato.paqueteId,
          modalidad: contrato.modalidad,
          montoMensual: contrato.montoMensual === null ? null : Number(contrato.montoMensual),
          periodicidad: contrato.periodicidad,
          proximaFactura: contrato.proximaFactura ? contrato.proximaFactura.toISOString() : null,
          estado: contrato.estado,
          notas: contrato.notas,
        }}
      />
    </div>
  );
}
