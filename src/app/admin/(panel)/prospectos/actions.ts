"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { EstadoProspecto } from "@/generated/prisma/client";

export type ProspectoFormState = { error: string };

export async function guardarProspecto(
  id: string,
  _prevState: ProspectoFormState,
  formData: FormData
): Promise<ProspectoFormState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const empresa = String(formData.get("empresa") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const servicioInteres = String(formData.get("servicioInteres") ?? "").trim();
  const mensaje = String(formData.get("mensaje") ?? "").trim();

  if (!nombre) return { error: "El nombre es obligatorio" };

  await prisma.prospecto.update({
    where: { id },
    data: {
      nombre,
      empresa: empresa || null,
      email: email || null,
      telefono: telefono || null,
      servicioInteres: servicioInteres || null,
      mensaje: mensaje || null,
    },
  });

  revalidatePath(`/admin/prospectos/${id}`);
  revalidatePath("/admin/prospectos");
  return { error: "" };
}

export async function eliminarProspecto(id: string) {
  await prisma.prospecto.delete({ where: { id } });
  revalidatePath("/admin/prospectos");
  redirect("/admin/prospectos");
}

export async function actualizarEstadoProspecto(id: string, estado: EstadoProspecto) {
  await prisma.prospecto.update({ where: { id }, data: { estado } });
  revalidatePath("/admin/prospectos");
  revalidatePath(`/admin/prospectos/${id}`);
  revalidatePath("/admin");
}

export async function guardarNotasProspecto(id: string, notasInternas: string) {
  await prisma.prospecto.update({ where: { id }, data: { notasInternas } });
  revalidatePath(`/admin/prospectos/${id}`);
}
