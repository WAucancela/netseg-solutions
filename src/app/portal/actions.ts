"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const SolicitudSchema = z.object({
  tipo: z.enum(["INSPECCION", "COTIZACION", "SOPORTE"]),
  descripcion: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)"),
  activoId: z.string().trim().optional(),
});

export type SolicitudFormState = { error: string };

export async function crearSolicitud(
  _prevState: SolicitudFormState,
  formData: FormData
): Promise<SolicitudFormState> {
  const session = await getSession();
  if (!session?.clienteId) {
    return { error: "Tu usuario no tiene un cliente asociado." };
  }

  const parsed = SolicitudSchema.safeParse({
    tipo: formData.get("tipo"),
    descripcion: formData.get("descripcion"),
    activoId: formData.get("activoId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario" };
  }

  const { tipo, descripcion, activoId } = parsed.data;

  if (activoId) {
    const activo = await prisma.activoCliente.findFirst({ where: { id: activoId, clienteId: session.clienteId } });
    if (!activo) {
      return { error: "El equipo seleccionado no es válido." };
    }
  }

  await prisma.solicitud.create({
    data: {
      clienteId: session.clienteId,
      tipo,
      descripcion,
      activoId: activoId || null,
    },
  });

  revalidatePath("/portal");
  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin");
  return { error: "" };
}
