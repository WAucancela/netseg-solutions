import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  UserPlusIcon,
  BuildingIcon,
  FolderIcon,
  NetworkIcon,
  ReceiptIcon,
  FileSignatureIcon,
  InboxIcon,
  ClipboardCheckIcon,
} from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    nuevos,
    solicitudesNuevas,
    totalClientes,
    proyectosActivos,
    totalActivos,
    cotizacionesAbiertas,
    contratosActivos,
  ] = await Promise.all([
    prisma.prospecto.count({ where: { estado: "NUEVO" } }),
    prisma.solicitud.count({ where: { estado: { in: ["NUEVA", "EN_PROCESO"] } } }),
    prisma.cliente.count(),
    prisma.proyecto.count({ where: { estado: { in: ["PLANIFICADO", "EN_PROGRESO"] } } }),
    prisma.activoCliente.count(),
    prisma.cotizacion.count({ where: { estado: { in: ["BORRADOR", "ENVIADA"] } } }),
    prisma.contrato.count({ where: { estado: "ACTIVO" } }),
  ]);

  const ultimosProspectos = await prisma.prospecto.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { href: "/admin/prospectos", icon: UserPlusIcon, num: nuevos, label: "Prospectos nuevos" },
    { href: "/admin/solicitudes", icon: ClipboardCheckIcon, num: solicitudesNuevas, label: "Solicitudes abiertas" },
    { href: "/admin/clientes", icon: BuildingIcon, num: totalClientes, label: "Clientes" },
    { href: "/admin/proyectos", icon: FolderIcon, num: proyectosActivos, label: "Proyectos en curso" },
    { href: "/admin/activos", icon: NetworkIcon, num: totalActivos, label: "Activos de red" },
    { href: "/admin/cotizaciones", icon: ReceiptIcon, num: cotizacionesAbiertas, label: "Cotizaciones abiertas" },
    { href: "/admin/contratos", icon: FileSignatureIcon, num: contratosActivos, label: "Contratos activos" },
  ];

  return (
    <div>
      <div className="admin-page-head">
        <h1>Resumen</h1>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="stat-tile">
            <span className="icon">
              <s.icon size={18} />
            </span>
            <span>
              <span className="num mono">{s.num}</span>
              <span className="lbl" style={{ display: "block" }}>
                {s.label}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <h2 style={{ fontFamily: "var(--font-poppins)", fontSize: "1.05rem", marginBottom: 14 }}>
          Últimos prospectos
        </h2>
        {ultimosProspectos.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <InboxIcon />
            </span>
            <p>Todavía no hay solicitudes desde el formulario público del sitio.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Servicio</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ultimosProspectos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/prospectos/${p.id}`}>{p.nombre}</Link>
                  </td>
                  <td>{p.servicioInteres ?? "—"}</td>
                  <td>
                    <span className={`badge-estado ${p.estado}`}>{p.estado}</span>
                  </td>
                  <td>{p.createdAt.toLocaleDateString("es-EC")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {ultimosProspectos.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <Link href="/admin/prospectos" className="btn btn-ghost btn-sm">
              Ver todos los prospectos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
