import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardarEmpleado, eliminarEmpleado } from "../actions";
import { EmpleadoForm } from "../empleado-form";
import { RolForm } from "./rol-form";
import { RolRowActions } from "./rol-row-actions";
import { TrashIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function EmpleadoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const empleado = await prisma.empleado.findUnique({
    where: { id },
    include: { rolesPago: { orderBy: { periodo: "desc" } } },
  });
  if (!empleado) notFound();

  return (
    <div>
      <div className="admin-page-head">
        <h1>
          {empleado.nombres} {empleado.apellidos}
        </h1>
        <form action={eliminarEmpleado.bind(null, empleado.id)}>
          <button type="submit" className="btn btn-ghost btn-sm">
            <TrashIcon /> Eliminar
          </button>
        </form>
      </div>

      <EmpleadoForm
        action={guardarEmpleado.bind(null, empleado.id)}
        inicial={{
          nombres: empleado.nombres,
          apellidos: empleado.apellidos,
          cedula: empleado.cedula,
          cargo: empleado.cargo,
          fechaIngreso: empleado.fechaIngreso.toISOString(),
          salarioMensual: Number(empleado.salarioMensual),
          email: empleado.email,
          telefono: empleado.telefono,
          estado: empleado.estado,
        }}
      />

      <div className="admin-card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: "1rem", marginBottom: 12 }}>Roles de pago</h2>
        {empleado.rolesPago.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: ".86rem" }}>Sin roles de pago generados todavía.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Ingresos</th>
                <th>Descuentos</th>
                <th>Líquido a recibir</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {empleado.rolesPago.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.periodo}</td>
                  <td className="mono">${Number(r.totalIngresos).toFixed(2)}</td>
                  <td className="mono">${Number(r.totalDescuentos).toFixed(2)}</td>
                  <td className="mono">${Number(r.liquidoRecibir).toFixed(2)}</td>
                  <td>
                    <RolRowActions rolId={r.id} empleadoId={empleado.id} estado={r.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RolForm empleadoId={empleado.id} />
    </div>
  );
}
