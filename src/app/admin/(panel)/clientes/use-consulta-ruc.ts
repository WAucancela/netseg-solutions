"use client";

import { useState } from "react";
import { consultarRuc, type DatosRuc } from "./actions";

export type EstadoConsultaRuc = "inactivo" | "buscando" | "encontrado" | "error";

export function useConsultaRuc() {
  const [estado, setEstado] = useState<EstadoConsultaRuc>("inactivo");
  const [mensaje, setMensaje] = useState("");

  async function buscar(numero: string): Promise<DatosRuc | null> {
    const limpio = numero.trim();
    if (!/^\d{10}$|^\d{13}$/.test(limpio)) {
      setEstado("inactivo");
      setMensaje("");
      return null;
    }

    setEstado("buscando");
    setMensaje("Consultando SRI...");
    const resultado = await consultarRuc(limpio);

    if (resultado.ok) {
      setEstado("encontrado");
      setMensaje(`Encontrado: ${resultado.razonSocial}`);
    } else {
      // Respaldo silencioso: el SRI suele rechazar peticiones desde IPs de nube (Vercel), así
      // que esto falla seguido en producción. No tiene sentido mostrarlo como error cada vez —
      // el campo sigue siendo 100% editable a mano, sin ninguna señal de que algo "se rompió".
      setEstado("inactivo");
      setMensaje("");
    }
    return resultado;
  }

  return { estado, mensaje, buscar };
}
