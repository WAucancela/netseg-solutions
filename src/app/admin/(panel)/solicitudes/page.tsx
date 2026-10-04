import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClipboardCheckIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = {
  INSPECCION: "Inspección",
  COTIZACION: "Cotización",
  SOPORTE: "Soporte técnico",
};

export default async function SolicitudesPage() {
  const solicitudes = await prisma.solicitud.findMany({
    orderBy: { createdAt: "desc" },
    include: { cliente: true },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Solicitudes</h1>
      </div>
      <div className="admin-card">
        {solicitudes.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <ClipboardCheckIcon size={22} />
            </span>
            <p>No hay solicitudes todavía. Aparecerán aquí cuando un cliente pida una inspección, cotización o soporte desde su portal.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/admin/solicitudes/${s.id}`}>{s.cliente.razonSocial}</Link>
                  </td>
                  <td>{TIPO_LABEL[s.tipo] ?? s.tipo}</td>
                  <td style={{ fontSize: ".84rem", color: "var(--muted)", maxWidth: 360 }}>{s.descripcion}</td>
                  <td>
                    <span className={`badge-estado ${s.estado}`}>{s.estado}</span>
                  </td>
                  <td>{s.createdAt.toLocaleDateString("es-EC")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
