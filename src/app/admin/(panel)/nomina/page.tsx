import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WalletIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function NominaPage() {
  const empleados = await prisma.empleado.findMany({
    orderBy: { nombres: "asc" },
    include: { _count: { select: { rolesPago: true } } },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Nómina</h1>
        <Link href="/admin/nomina/nuevo" className="btn btn-primary btn-sm">
          Nuevo empleado
        </Link>
      </div>

      <div className="secaas-banner" style={{ marginTop: 0, marginBottom: 16 }}>
        <p>
          <strong>Herramienta de cálculo, no reemplaza a tu contador.</strong> Los aportes IESS (9.45% personal /
          11.15% patronal) y los décimos se calculan automáticamente; el impuesto a la renta queda como un valor
          editable porque su tabla cambia cada año y debe confirmarla un profesional.
        </p>
      </div>

      <div className="admin-card">
        {empleados.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <WalletIcon size={22} />
            </span>
            <p>No hay empleados registrados todavía.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Salario mensual</th>
                <th>Roles de pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link href={`/admin/nomina/${e.id}`}>
                      {e.nombres} {e.apellidos}
                    </Link>
                  </td>
                  <td>{e.cargo}</td>
                  <td className="mono">${Number(e.salarioMensual).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  <td>{e._count.rolesPago}</td>
                  <td>
                    <span className={`badge-estado ${e.estado}`}>{e.estado === "ACTIVO" ? "Activo" : "Inactivo"}</span>
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
