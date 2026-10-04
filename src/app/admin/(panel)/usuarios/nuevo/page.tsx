import { prisma } from "@/lib/prisma";
import { guardarUsuario } from "../actions";
import { UsuarioForm } from "../usuario-form";

export const dynamic = "force-dynamic";

export default async function NuevoUsuarioPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { razonSocial: "asc" } });

  return (
    <div>
      <div className="admin-page-head">
        <h1>Nuevo usuario</h1>
      </div>
      <UsuarioForm action={guardarUsuario.bind(null, null)} clientes={clientes} />
    </div>
  );
}
