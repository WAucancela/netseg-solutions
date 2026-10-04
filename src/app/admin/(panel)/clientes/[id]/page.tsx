import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardarCliente, eliminarCliente } from "../actions";
import { ClienteForm } from "../cliente-form";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      proyectos: { orderBy: { createdAt: "desc" } },
      activos: { orderBy: { createdAt: "desc" } },
      cotizaciones: { orderBy: [{ numero: "desc" }, { version: "desc" }], include: { lineas: true } },
    },
  });
  if (!cliente) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>{cliente.razonSocial}</h1>
        <form action={eliminarCliente.bind(null, cliente.id)}>
          <button type="submit" className="btn btn-ghost btn-sm">
            <TrashIcon /> Eliminar
          </button>
        </form>
      </div>

      <ClienteForm
        action={guardarCliente.bind(null, cliente.id)}
        inicial={{
          ruc: cliente.ruc,
          razonSocial: cliente.razonSocial,
          nombreComercial: cliente.nombreComercial,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          notas: cliente.notas,
        }}
      />

      <div className="admin-card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: "1rem" }}>Proyectos</h2>
          <Link href={`/admin/proyectos/nuevo?clienteId=${cliente.id}`} className="btn btn-ghost btn-sm">
            Nuevo proyecto
          </Link>
        </div>
        {cliente.proyectos.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: ".86rem" }}>Sin proyectos todavía.</p>
        ) : (
          <table className="admin-table">
            <tbody>
              {cliente.proyectos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/proyectos/${p.id}`}>{p.nombre}</Link>
                  </td>
                  <td>
                    <span className={`badge-estado ${p.estado}`}>{p.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: "1rem" }}>Activos de red</h2>
          <Link href={`/admin/activos/nuevo?clienteId=${cliente.id}`} className="btn btn-ghost btn-sm">
            Nuevo activo
          </Link>
        </div>
        {cliente.activos.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: ".86rem" }}>Sin activos registrados todavía.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>IP</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cliente.activos.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/activos/${a.id}`}>{a.nombre}</Link>
                  </td>
                  <td>{a.categoria}</td>
                  <td className="mono">{a.ip ?? "—"}</td>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: "1rem" }}>Cotizaciones</h2>
          <Link href={`/admin/cotizaciones/nuevo?clienteId=${cliente.id}`} className="btn btn-ghost btn-sm">
            Nueva cotización
          </Link>
        </div>
        {cliente.cotizaciones.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: ".86rem" }}>Sin cotizaciones todavía.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Proyecto</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {cliente.cotizaciones.map((c) => {
                const subtotal = c.lineas.reduce((acc, l) => acc + Number(l.cantidad) * Number(l.precioUnitario), 0);
                const total = subtotal * (1 + Number(c.ivaPct) / 100);
                return (
                  <tr key={c.id}>
                    <td className="mono">
                      <Link href={`/admin/cotizaciones/${c.id}`}>
                        {c.numero}
                        {c.version > 1 && <span style={{ color: "var(--muted)" }}> · v{c.version}</span>}
                      </Link>
                    </td>
                    <td style={{ fontSize: ".84rem", color: "var(--muted)" }}>{c.proyecto ?? "—"}</td>
                    <td className="mono">${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge-estado ${c.estado}`}>{c.estado}</span>
                    </td>
                    <td style={{ fontSize: ".84rem" }}>{c.fecha.toLocaleDateString("es-EC")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
