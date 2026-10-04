import { guardarEmpleado } from "../actions";
import { EmpleadoForm } from "../empleado-form";

export default function NuevoEmpleadoPage() {
  return (
    <div>
      <div className="admin-page-head">
        <h1>Nuevo empleado</h1>
      </div>
      <EmpleadoForm action={guardarEmpleado.bind(null, null)} />
    </div>
  );
}
