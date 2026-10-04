import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FileSignatureIcon, PencilIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

export default async function ContratosPage() {
  const contratos = await prisma.contrato.findMany({
    orderBy: { createdAt: "desc" },
    include: { paquete: true },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Contratos</h1>
        <Link href="/admin/contratos/nuevo" className="btn btn-primary btn-sm">
          Nuevo contrato
        </Link>
      </div>
      <div className="admin-card">
        {contratos.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <FileSignatureIcon size={22} />
            </span>
            <p>No hay contratos registrados. Se crean sueltos o a partir de un cliente y un paquete.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Paquete</th>
                <th>Modalidad</th>
                <th>Monto</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/contratos/${c.id}`}>{c.clienteNombre}</Link>
                  </td>
                  <td>{c.paquete?.nombre ?? "—"}</td>
                  <td>{c.modalidad === "SECAAS" ? "Renta (SECaaS)" : "Compra"}</td>
                  <td>{c.montoMensual ? `$${Number(c.montoMensual).toLocaleString("en-US")}` : "—"}</td>
                  <td>
                    <span className={`badge-estado ${c.estado}`}>{c.estado}</span>
                  </td>
                  <td>
                    <Link href={`/admin/contratos/${c.id}`} className="btn btn-ghost btn-sm">
                      <PencilIcon /> Editar
                    </Link>
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
