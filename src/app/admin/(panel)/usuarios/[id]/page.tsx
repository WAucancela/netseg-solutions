import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { guardarUsuario, eliminarUsuario } from "../actions";
import { UsuarioForm } from "../usuario-form";
import { TrashIcon } from "@/components/admin-icons";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [usuario, clientes, session] = await Promise.all([
    prisma.usuario.findUnique({ where: { id } }),
    prisma.cliente.findMany({ orderBy: { razonSocial: "asc" } }),
    getSession(),
  ]);
  if (!usuario) notFound();
  const esUnoMismo = session?.usuarioId === usuario.id;

  return (
    <div>
      <div className="admin-page-head">
        <h1>{usuario.nombre}</h1>
        {!esUnoMismo && (
          <form action={eliminarUsuario.bind(null, usuario.id)}>
            <button type="submit" className="btn btn-ghost btn-sm">
              <TrashIcon /> Eliminar
            </button>
          </form>
        )}
      </div>
      <UsuarioForm
        action={guardarUsuario.bind(null, usuario.id)}
        clientes={clientes}
        inicial={{
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          clienteId: usuario.clienteId,
          activo: usuario.activo,
        }}
      />
    </div>
  );
}
