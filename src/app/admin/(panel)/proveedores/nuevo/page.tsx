import { guardarProveedor } from "../actions";
import { ProveedorForm } from "../proveedor-form";

export default function NuevoProveedorPage() {
  return (
    <div>
      <div className="admin-page-head">
        <h1>Nuevo proveedor</h1>
      </div>
      <ProveedorForm action={guardarProveedor.bind(null, null)} />
    </div>
  );
}
