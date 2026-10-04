import { guardarServicio } from "../actions";
import { ServicioForm } from "../servicio-form";

export default function NuevoServicioPage() {
  return (
    <div>
      <div className="admin-page-head">
        <h1>Nuevo servicio</h1>
      </div>
      <ServicioForm action={guardarServicio.bind(null, null)} />
    </div>
  );
}
