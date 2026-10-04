import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SolicitudDetailForm } from "../detail-form";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = {
  INSPECCION: "Inspección",
  COTIZACION: "Cotización",
  SOPORTE: "Soporte técnico",
};

export default async function SolicitudDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const solicitud = await prisma.solicitud.findUnique({
    where: { id },
    include: { cliente: true, activo: true },
  });
  if (!solicitud) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>
          {TIPO_LABEL[solicitud.tipo] ?? solicitud.tipo} · {solicitud.cliente.razonSocial}
        </h1>
        {solicitud.tipo === "COTIZACION" ? (
          <Link href={`/admin/cotizaciones/nuevo?clienteId=${solicitud.clienteId}`} className="btn btn-primary btn-sm">
            Crear cotización
          </Link>
        ) : (
          <Link href={`/admin/proyectos/nuevo?clienteId=${solicitud.clienteId}`} className="btn btn-primary btn-sm">
            Crear proyecto
          </Link>
        )}
      </div>

      <div className="admin-card">
        <div className="field">
          <label>Cliente</label>
          <p>
            <Link href={`/admin/clientes/${solicitud.clienteId}`}>{solicitud.cliente.razonSocial}</Link>
          </p>
        </div>
        {solicitud.activo && (
          <div className="field">
            <label>Equipo relacionado</label>
            <p>
              <Link href={`/admin/activos/${solicitud.activo.id}`}>{solicitud.activo.nombre}</Link>
            </p>
          </div>
        )}
        <div className="field">
          <label>Descripción del cliente</label>
          <p style={{ whiteSpace: "pre-wrap" }}>{solicitud.descripcion}</p>
        </div>
        <div className="field">
          <label>Recibida</label>
          <p>{solicitud.createdAt.toLocaleString("es-EC")}</p>
        </div>
      </div>

      <SolicitudDetailForm id={solicitud.id} estadoInicial={solicitud.estado} notasIniciales={solicitud.notasInternas ?? ""} />
    </div>
  );
}
