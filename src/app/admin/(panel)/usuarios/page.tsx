import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UsersIcon, PencilIcon } from "@/components/admin-icons";

export const dynamic = "force-dynamic";

const ROL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  TECNICO: "Técnico",
  CLIENTE: "Cliente",
};

export default async function UsuariosPage() {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: "asc" },
    include: { cliente: true },
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Usuarios</h1>
        <Link href="/admin/usuarios/nuevo" className="btn btn-primary btn-sm">
          Nuevo usuario
        </Link>
      </div>
      <div className="admin-card">
        {usuarios.length === 0 ? (
          <div className="admin-empty">
            <span className="icon">
              <UsersIcon size={22} />
            </span>
            <p>No hay usuarios registrados.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>
                    <Link href={`/admin/usuarios/${u.id}`}>{u.nombre}</Link>
                  </td>
                  <td>{u.email}</td>
                  <td>{ROL_LABEL[u.rol] ?? u.rol}</td>
                  <td>{u.cliente?.razonSocial ?? "—"}</td>
                  <td>
                    <span className={`badge-estado ${u.activo ? "ACTIVO" : "CANCELADO"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/usuarios/${u.id}`} className="btn btn-ghost btn-sm">
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
