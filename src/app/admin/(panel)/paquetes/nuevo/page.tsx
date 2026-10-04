import { guardarPaquete } from "../actions";
import { PaqueteForm } from "../paquete-form";

export default function NuevoPaquetePage() {
  return (
    <div>
      <div className="admin-page-head">
        <h1>Nuevo paquete</h1>
      </div>
      <PaqueteForm action={guardarPaquete.bind(null, null)} />
    </div>
  );
}
