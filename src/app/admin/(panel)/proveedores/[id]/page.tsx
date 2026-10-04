import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardarProveedor, eliminarProveedor } from "../actions";
import { ProveedorForm } from "../proveedor-form";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ProveedorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proveedor = await prisma.proveedor.findUnique({ where: { id } });
  if (!proveedor) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{proveedor.nombre}</h1>
        <form action={eliminarProveedor.bind(null, proveedor.id)}>
          <button type="submit" className="btn btn-ghost btn-sm">
            <TrashIcon /> Eliminar
          </button>
        </form>
      </div>
      <ProveedorForm
        action={guardarProveedor.bind(null, proveedor.id)}
        inicial={{
          nombre: proveedor.nombre,
          ruc: proveedor.ruc,
          contacto: proveedor.contacto,
          telefono: proveedor.telefono,
          email: proveedor.email,
          notas: proveedor.notas,
        }}
      />
    </div>
  );
}
