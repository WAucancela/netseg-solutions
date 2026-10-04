"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ClienteFormState = { error: string };

export type DatosRuc =
  | { ok: true; razonSocial: string; nombreComercial: string | null; direccion: string | null }
  | { ok: false; error: string };

const SRI_URL =
  "https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/obtenerPorNumerRuc";

/**
 * Consulta razon social / nombre comercial / direccion en el SRI a partir de un RUC (13 digitos)
 * o cedula (10 digitos). Es la misma consulta no oficial que ya usa InfraControl en producción
 * (core/sri_client.py) — nunca debe bloquear el guardado del cliente si el SRI no responde.
 *
 * El timeout va por Promise.race (no solo AbortController): el SRI a veces completa el handshake
 * TLS y despues no manda nada, y depender solo de abortar la señal del fetch no siempre corta la
 * espera a tiempo. Con la carrera, la función SIEMPRE devuelve antes de los ~8s, pase lo que pase
 * con la conexión de fondo.
 */
export async function consultarRuc(numero: string): Promise<DatosRuc> {
  const limpio = numero.trim();
  if (!/^\d{10}$|^\d{13}$/.test(limpio)) {
    return { ok: false, error: "Debe tener 10 (cédula) o 13 (RUC) dígitos" };
  }

  const consulta = (async () => {
    const res = await fetch(`${SRI_URL}?numeroRuc=${limpio}`, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`SRI respondió ${res.status}`);
    return res.json();
  })();

  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000));

  let data: unknown;
  try {
    data = await Promise.race([consulta, timeout]);
  } catch {
    return { ok: false, error: "No se pudo consultar el SRI en este momento — ingresa los datos manualmente" };
  }

  const razonSocial = (data as Record<string, unknown>)?.razonSocial;
  if (typeof razonSocial !== "string" || !razonSocial) {
    return { ok: false, error: "No se encontró información para ese número en el SRI" };
  }

  const registro = data as Record<string, unknown>;
  const establecimientos = registro.establecimientoComercial;
  const establecimiento = Array.isArray(establecimientos) ? establecimientos[0] : null;

  return {
    ok: true,
    razonSocial,
    nombreComercial: typeof registro.nombreComercial === "string" ? registro.nombreComercial : null,
    direccion:
      establecimiento && typeof establecimiento === "object" && typeof establecimiento.direccionCompleta === "string"
        ? establecimiento.direccionCompleta
        : null,
  };
}

export async function guardarCliente(
  id: string | null,
  _prevState: ClienteFormState,
  formData: FormData
): Promise<ClienteFormState> {
  const ruc = String(formData.get("ruc") ?? "").trim();
  const razonSocial = String(formData.get("razonSocial") ?? "").trim();
  const nombreComercial = String(formData.get("nombreComercial") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();

  if (!ruc || !razonSocial) {
    return { error: "RUC y razón social son obligatorios" };
  }

  const data = {
    ruc,
    razonSocial,
    nombreComercial: nombreComercial || null,
    email: email || null,
    telefono: telefono || null,
    direccion: direccion || null,
    notas: notas || null,
  };

  try {
    let clienteId = id;
    if (id) {
      await prisma.cliente.update({ where: { id }, data });
    } else {
      const creado = await prisma.cliente.create({ data });
      clienteId = creado.id;
    }
    revalidatePath("/admin/clientes");
    redirect(`/admin/clientes/${clienteId}`);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { error: "Ya existe un cliente con ese RUC" };
    }
    throw e;
  }
}

export async function eliminarCliente(id: string) {
  await prisma.cliente.delete({ where: { id } });
  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}

export async function crearClienteDesdeProspecto(
  prospectoId: string,
  _prevState: ClienteFormState,
  formData: FormData
): Promise<ClienteFormState> {
  const ruc = String(formData.get("ruc") ?? "").trim();
  const razonSocial = String(formData.get("razonSocial") ?? "").trim();

  if (!ruc || !razonSocial) {
    return { error: "RUC y razón social son obligatorios" };
  }

  const prospecto = await prisma.prospecto.findUnique({ where: { id: prospectoId } });
  if (!prospecto) return { error: "Prospecto no encontrado" };

  let cliente;
  try {
    cliente = await prisma.cliente.create({
      data: {
        ruc,
        razonSocial,
        email: prospecto.email,
        telefono: prospecto.telefono,
        notas: prospecto.mensaje,
        prospectoId: prospecto.id,
      },
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { error: "Ya existe un cliente con ese RUC, o este prospecto ya fue convertido" };
    }
    throw e;
  }

  await prisma.prospecto.update({ where: { id: prospectoId }, data: { estado: "GANADO" } });

  revalidatePath(`/admin/prospectos/${prospectoId}`);
  revalidatePath("/admin/clientes");
  redirect(`/admin/clientes/${cliente.id}`);
}
