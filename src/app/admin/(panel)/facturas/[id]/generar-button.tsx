"use client";

import { useState, useTransition } from "react";
import { generarXmlYClave } from "../actions";

export function GenerarButton({ facturaId }: { facturaId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function onClick() {
    startTransition(async () => {
      const res = await generarXmlYClave(facturaId);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div>
      <button type="button" className="btn btn-primary btn-sm" onClick={onClick} disabled={isPending}>
        {isPending ? "Generando..." : "Generar XML y clave de acceso"}
      </button>
      {error && <p className="form-note error">{error}</p>}
    </div>
  );
}
