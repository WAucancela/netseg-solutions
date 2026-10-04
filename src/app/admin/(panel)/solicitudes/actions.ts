"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EstadoSolicitud } from "@/generated/prisma/client";

export async function actualizarEstadoSolicitud(id: string, estado: EstadoSolicitud) {
  await prisma.solicitud.update({ where: { id }, data: { estado } });
  revalidatePath("/admin/solicitudes");
  revalidatePath(`/admin/solicitudes/${id}`);
  revalidatePath("/admin");
}

export async function guardarNotasSolicitud(id: string, notasInternas: string) {
  await prisma.solicitud.update({ where: { id }, data: { notasInternas } });
  revalidatePath(`/admin/solicitudes/${id}`);
}
