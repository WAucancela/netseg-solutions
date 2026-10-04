import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIAS } from "@/lib/taxonomia";
import {
  FolderIcon,
  NetworkIcon,
  ReceiptIcon,
  InvoiceIcon,
  InboxIcon,
  ClipboardCheckIcon,
} from "@/components/admin-icons";
import { SolicitudForm } from "./solicitud-form";

export const dynamic = "force-dynamic";

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TIPO_SOLICITUD_LABEL: Record<string, string> = {
  INSPECCION: "Inspección",
  COTIZACION: "Cotización",
  SOPORTE: "Soporte técnico",
};

function totalDe(lineas: { cantidad: unknown; precioUnitario: unknown }[], ivaPct: unknown) {
  const subtotal = lineas.reduce((acc, l) => acc + Number(l.cantidad) * Number(l.precioUnitario), 0);
  return subtotal * (1 + Number(ivaPct) / 100);
}

export default async function PortalPage() {
  const session = await getSession();
  if (!session?.clienteId) {
    return (
      <div className="admin-card">
        <p style={{ color: "var(--muted)" }}>
          Esta vista es específica de un cliente. Tu usuario no tiene un cliente asociado.
        </p>
      </div>
    );
  }

  const cliente = await prisma.cliente.findUnique({
    where: { id: session.clienteId },
    include: {
      proyectos: { orderBy: { createdAt: "desc" }, include: { tareas: true } },
      activos: { orderBy: { createdAt: "desc" } },
      cotizaciones: { orderBy: { createdAt: "desc" }, include: { lineas: true } },
      facturas: { orderBy: { createdAt: "desc" }, include: { lineas: true } },
      solicitudes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!cliente) {
    return (
      <div className="admin-card">
        <p style={{ color: "var(--muted)" }}>No se encontró tu información de cliente.</p>
      </div>
    );
  }

  const proyectosEnCurso = cliente.proyectos.filter((p) => p.estado === "PLANIFICADO" || p.estado === "EN_PROGRESO").length;
  const cotizacionesVigentes = cliente.cotizaciones.filter((c) => c.estado === "BORRADOR" || c.estado === "ENVIADA").length;
  const facturasEmitidas = cliente.facturas.filter((f) => f.estado === "GENERADA").length;
  const totalFacturado = cliente.facturas
    .filter((f) => f.estado === "GENERADA")
    .reduce((acc, f) => acc + totalDe(f.lineas, f.ivaPct), 0);
  const solicitudesAbiertas = cliente.solicitudes.filter((s) => s.estado === "NUEVA" || s.estado === "EN_PROCESO").length;

  const stats = [
    { icon: FolderIcon, num: proyectosEnCurso, label: "Proyectos en curso" },
    { icon: NetworkIcon, num: cliente.activos.length, label: "Activos instalados" },
    { icon: ReceiptIcon, num: cotizacionesVigentes, label: "Cotizaciones vigentes" },
    { icon: InvoiceIcon, num: facturasEmitidas, label: "Facturas emitidas" },
    { icon: ClipboardCheckIcon, num: solicitudesAbiertas, label: "Solicitudes abiertas" },
  ];

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Hola, {cliente.nombreComercial || cliente.razonSocial}</h1>
          <p style={{ color: "var(--muted)", fontSize: ".84rem", marginTop: 4 }}>
            RUC {cliente.ruc}
            {cliente.telefono ? ` · ${cliente.telefono}` : ""}
            {cliente.email ? ` · ${cliente.email}` : ""}
          </p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-tile">
            <span className="icon">
              <s.icon size={18} />
            </span>
            <span>
              <span className="num mono">{s.num}</span>
              <span className="lbl" style={{ display: "block" }}>
                {s.label}
              </span>
            </span>
          </div>
        ))}
      </div>

      <SolicitudForm activos={cliente.activos.map((a) => ({ id: a.id, nombre: a.nombre }))} />

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-poppins)", fontSize: "1.05rem", marginBottom: 14 }}>Mis solicitudes</h2>
        {cliente.solicitudes.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <ClipboardCheckIcon size={22} />
            </span>
            <p>Todavía no has enviado ninguna solicitud.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cliente.solicitudes.map((s) => (
                <tr key={s.id}>
                  <td>{TIPO_SOLICITUD_LABEL[s.tipo] ?? s.tipo}</td>
                  <td style={{ fontSize: ".84rem", color: "var(--muted)", maxWidth: 360 }}>{s.descripcion}</td>
                  <td style={{ fontSize: ".84rem" }}>{s.createdAt.toLocaleDateString("es-EC")}</td>
                  <td>
                    <span className={`badge-estado ${s.estado}`}>{s.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card">
        <h2 style={{ fontFamily: "var(--font-poppins)", fontSize: "1.05rem", marginBottom: 14 }}>Proyectos</h2>
        {cliente.proyectos.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <FolderIcon size={22} />
            </span>
            <p>Todavía no tienes proyectos registrados.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Progreso de tareas</th>
                <th>Inicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cliente.proyectos.map((p) => {
                const completadas = p.tareas.filter((t) => t.estado === "COMPLETADA").length;
                return (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td className="mono" style={{ color: "var(--muted)" }}>
                      {p.tareas.length === 0 ? "—" : `${completadas}/${p.tareas.length} completadas`}
                    </td>
                    <td style={{ fontSize: ".84rem" }}>{p.fechaInicio ? p.fechaInicio.toLocaleDateString("es-EC") : "—"}</td>
                    <td>
                      <span className={`badge-estado ${p.estado}`}>{p.estado}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontFamily: "var(--font-poppins)", fontSize: "1.05rem", marginBottom: 14 }}>Activos instalados</h2>
        {cliente.activos.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <NetworkIcon size={22} />
            </span>
            <p>Todavía no hay equipos registrados a tu nombre.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Categoría</th>
                <th>Ubicación</th>
                <th>Instalado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cliente.activos.map((a) => (
                <tr key={a.id}>
                  <td>{a.nombre}</td>
                  <td style={{ fontSize: ".84rem", color: "var(--muted)" }}>
                    {CATEGORIAS[a.categoria as keyof typeof CATEGORIAS] ?? a.categoria}
                  </td>
                  <td style={{ fontSize: ".84rem" }}>{a.ubicacion ?? "—"}</td>
                  <td style={{ fontSize: ".84rem" }}>{a.fechaInstalacion ? a.fechaInstalacion.toLocaleDateString("es-EC") : "—"}</td>
                  <td>
                    <span className={`badge-estado ${a.estado}`}>{a.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontFamily: "var(--font-poppins)", fontSize: "1.05rem", marginBottom: 14 }}>Cotizaciones</h2>
        {cliente.cotizaciones.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <ReceiptIcon size={22} />
            </span>
            <p>Todavía no tienes cotizaciones.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cliente.cotizaciones.map((c) => (
                <tr key={c.id}>
                  <td className="mono">
                    {c.numero}
                    {c.version > 1 && <span style={{ color: "var(--muted)" }}> · v{c.version}</span>}
                  </td>
                  <td style={{ fontSize: ".84rem" }}>{c.fecha.toLocaleDateString("es-EC")}</td>
                  <td className="mono">{fmt(totalDe(c.lineas, c.ivaPct))}</td>
                  <td>
                    <span className={`badge-estado ${c.estado}`}>{c.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontFamily: "var(--font-poppins)", fontSize: "1.05rem" }}>Facturas</h2>
          {facturasEmitidas > 0 && (
            <span style={{ fontSize: ".84rem", color: "var(--muted)" }}>
              Total facturado: <span className="mono">{fmt(totalFacturado)}</span>
            </span>
          )}
        </div>
        {cliente.facturas.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <InboxIcon />
            </span>
            <p>Todavía no tienes facturas.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cliente.facturas.map((f) => (
                <tr key={f.id}>
                  <td className="mono">{f.numero}</td>
                  <td style={{ fontSize: ".84rem" }}>{f.fecha.toLocaleDateString("es-EC")}</td>
                  <td className="mono">{fmt(totalDe(f.lineas, f.ivaPct))}</td>
                  <td>
                    <span className={`badge-estado ${f.estado}`}>{f.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
