import { guardarCliente } from "../actions";
import { ClienteForm } from "../cliente-form";

export default function NuevoClientePage() {
  return (
    <div>
      <div className="admin-page-head">
        <h1>Nuevo cliente</h1>
      </div>
      <ClienteForm action={guardarCliente.bind(null, null)} />
    </div>
  );
}
