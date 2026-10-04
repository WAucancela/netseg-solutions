import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { eliminarProspecto } from "../actions";
import { ProspectoForm } from "./prospecto-form";
import { ProspectoDetailForm } from "./detail-form";
import { ConvertirForm } from "./convertir-form";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ProspectoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [prospecto, clienteVinculado] = await Promise.all([
    prisma.prospecto.findUnique({ where: { id } }),
    prisma.cliente.findUnique({ where: { prospectoId: id } }),
  ]);
  if (!prospecto) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{prospecto.nombre}</h1>
        <form action={eliminarProspecto.bind(null, prospecto.id)}>
          <button type="submit" className="btn btn-ghost btn-sm">
            <TrashIcon /> Eliminar
          </button>
        </form>
      </div>

      <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 10 }}>
        Recibido el {prospecto.createdAt.toLocaleString("es-EC")}
      </p>

      <ProspectoForm
        id={prospecto.id}
        inicial={{
          nombre: prospecto.nombre,
          empresa: prospecto.empresa,
          email: prospecto.email,
          telefono: prospecto.telefono,
          servicioInteres: prospecto.servicioInteres,
          mensaje: prospecto.mensaje,
        }}
      />

      <ProspectoDetailForm
        id={prospecto.id}
        estadoInicial={prospecto.estado}
        notasIniciales={prospecto.notasInternas ?? ""}
      />

      {clienteVinculado ? (
        <div className="admin-card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: "1rem", marginBottom: 10 }}>Cliente vinculado</h2>
          <Link href={`/admin/clientes/${clienteVinculado.id}`} className="btn btn-ghost btn-sm">
            Ver {clienteVinculado.razonSocial}
          </Link>
        </div>
      ) : (
        <ConvertirForm prospectoId={prospecto.id} nombreSugerido={prospecto.empresa || prospecto.nombre} />
      )}
    </div>
  );
}
